import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './order-item.entity';
import { CartService } from '../cart/cart.service';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
  ) { }

  async createOrder(userId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this.cartService.findCartByUserId(userId);
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('No se puede crear una orden con el carrito vacío.');
      }

      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      if (!user) throw new NotFoundException('El usuario no existe.');

      // Creamos la instancia de la orden
      const order = queryRunner.manager.create(Order, {
        user,
        status: OrderStatus.PENDING,
        total: 0,
      });
      const savedOrder = await queryRunner.manager.save(order);

      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const cartItem of cart.items) {
        const product = await queryRunner.manager.findOneBy(Product, { id: cartItem.product.id });

        if (!product || product.stock < cartItem.quantity) {
          throw new BadRequestException(`Stock insuficiente para: ${product?.name || 'Producto'}`);
        }

        // Descuento de stock atómico
        product.stock -= cartItem.quantity;
        await queryRunner.manager.save(product);

        const orderItem = queryRunner.manager.create(OrderItem, {
          product,
          quantity: cartItem.quantity,
          priceAtPurchase: product.price,
          order: savedOrder,
        });

        orderItems.push(orderItem);
        total += product.price * cartItem.quantity;
      }

      // Actualizamos la orden con el total final
      savedOrder.total = total;
      await queryRunner.manager.save(savedOrder);
      await queryRunner.manager.save(orderItems);

      await this.cartService.clearCart(userId);
      await queryRunner.commitTransaction();

      return this.findOneOrder(savedOrder.id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error crítico al procesar la orden.');
    } finally {
      await queryRunner.release();
    }
  }

  async findOneOrder(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['items', 'items.product'],
    });
    if (!order) throw new NotFoundException(`Orden #${id} no encontrada.`);
    return order;
  }

  async findAllUserOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { orderDate: 'DESC' },
    });
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) throw new NotFoundException(`No se encontró la orden #${id}`);
    order.status = status;
    return this.orderRepository.save(order);
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
      order: { orderDate: 'DESC' },
    });
  }
}
