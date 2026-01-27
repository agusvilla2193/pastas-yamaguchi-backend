import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
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
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async createOrder(userId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this.cartService.findCartByUserId(userId);

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('El carrito está vacío.');
      }

      // Tipado fuerte al buscar el usuario
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      if (!user) throw new NotFoundException('Usuario no encontrado');

      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const cartItem of cart.items) {
        const product = await queryRunner.manager.findOneBy(Product, { id: cartItem.product.id });

        if (!product || product.stock < cartItem.quantity) {
          throw new BadRequestException(`Stock insuficiente para: ${cartItem.product.name}`);
        }

        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = cartItem.quantity;
        orderItem.priceAtPurchase = product.price;
        orderItems.push(orderItem);

        total += product.price * cartItem.quantity;

        // Descontamos stock dentro de la transacción
        product.stock -= cartItem.quantity;
        await queryRunner.manager.save(Product, product);
      }

      const order = new Order();
      order.user = user;
      order.total = total;
      order.status = 'PAID';
      const newOrder = await queryRunner.manager.save(Order, order);

      // Asociamos items a la orden creada
      orderItems.forEach(item => item.order = newOrder);
      await queryRunner.manager.save(OrderItem, orderItems);

      // Limpiamos carrito
      await this.cartService.clearCart(userId);

      await queryRunner.commitTransaction();

      // Devolvemos la orden con sus relaciones cargadas
      const finalOrder = await this.orderRepository.findOne({
        where: { id: newOrder.id },
        relations: ['items', 'items.product'],
      });

      if (!finalOrder) throw new Error('Error al recuperar la orden creada');
      return finalOrder;

    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();

      // Manejo de errores con tipado seguro
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException('Error al procesar la orden: ' + errorMessage);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllUserOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { orderDate: 'DESC' },
    });
  }

  async findOneOrder(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Orden #${id} no encontrada.`);
    }
    return order;
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
      order: { orderDate: 'DESC' },
    });
  }

  // Usamos un literal de tipo para los estados posibles
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException(`No se encontró la orden #${id}`);
    }

    order.status = status;
    return this.orderRepository.save(order);
  }
}
