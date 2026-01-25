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
    private orderRepository: Repository<Order>,
    private cartService: CartService,
    private dataSource: DataSource, // Usamos DataSource para transacciones
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

  // 1. CREAR UNA ORDEN A PARTIR DEL CARRITO
  async createOrder(userId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this.cartService.findCartByUserId(userId);

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('El carrito está vacío.');
      }

      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      let total = 0;
      const orderItems: OrderItem[] = [];

      // 2. VALIDAR STOCK Y CREAR ITEMS DE ORDEN
      for (const cartItem of cart.items) {
        const product = await queryRunner.manager.findOneBy(Product, { id: cartItem.product.id });

        if (!product || product.stock < cartItem.quantity) {
          throw new BadRequestException(`Stock insuficiente para el producto: ${cartItem.product.name}`);
        }

        // Crear el OrderItem
        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = cartItem.quantity;
        orderItem.priceAtPurchase = product.price; // Usar el precio actual
        orderItems.push(orderItem);

        total += product.price * cartItem.quantity;

        // 3. ACTUALIZAR STOCK (dentro de la transacción)
        product.stock -= cartItem.quantity;
        await queryRunner.manager.save(Product, product);
      }

      // 4. CREAR LA ORDEN
      const order = new Order();
      order.user = user;
      order.total = total;
      order.status = 'PAID';
      const newOrder = await queryRunner.manager.save(Order, order);

      // 5. ASIGNAR ITEMS A LA ORDEN
      for (const item of orderItems) {
        item.order = newOrder;
      }
      await queryRunner.manager.save(OrderItem, orderItems);

      // 6. VACIAR EL CARRITO
      await this.cartService.clearCart(userId);

      await queryRunner.commitTransaction();

      // Devolvemos la orden con sus items
      return this.orderRepository.findOne({
        where: { id: newOrder.id },
        relations: ['items', 'items.product'],
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      // Si falla la transacción por stock u otro error, lanzamos la excepción
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al procesar la orden: ' + error.message);

    } finally {
      await queryRunner.release();
    }
  }

  // 2. BUSCAR TODAS LAS ORDENES DE UN USUARIO
  findAllUserOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { orderDate: 'DESC' },
    });
  }

  // 3. BUSCAR UNA ORDEN ESPECÍFICA
  async findOneOrder(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }
    return order;
  }

  async findAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      // Traemos 'user' para ver quién hizo la compra, e 'items' para el detalle
      relations: ['user', 'items', 'items.product'],
      order: { orderDate: 'DESC' }, // Los pedidos más recientes primero
    });
  }
}
