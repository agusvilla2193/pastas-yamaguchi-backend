import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './order-item.entity';
import { CartService } from '../cart/cart.service';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

// Definimos los estados para evitar strings sueltos
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
  ) { }

  async createOrder(userId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar Carrito
      const cart = await this.cartService.findCartByUserId(userId);
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('No se puede crear una orden con el carrito vacío.');
      }

      // 2. Validar Usuario
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      if (!user) throw new NotFoundException('El usuario no existe.');

      let total = 0;
      const orderItems: OrderItem[] = [];

      // 3. Procesar Productos y Stock
      for (const cartItem of cart.items) {
        const product = await queryRunner.manager.findOneBy(Product, { id: cartItem.product.id });

        if (!product) {
          throw new NotFoundException(`El producto ${cartItem.product.name} ya no está disponible.`);
        }

        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(`Stock insuficiente para: ${product.name}. Disponible: ${product.stock}`);
        }

        // Crear item de la orden
        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = cartItem.quantity;
        orderItem.priceAtPurchase = product.price;
        orderItems.push(orderItem);

        total += product.price * cartItem.quantity;

        // Descontar stock
        product.stock -= cartItem.quantity;
        await queryRunner.manager.save(Product, product);
      }

      // 4. Crear la Orden
      const order = new Order();
      order.user = user;
      order.total = total;
      order.status = 'PENDING';

      const savedOrder = await queryRunner.manager.save(Order, order);

      // 5. Relacionar items con la orden guardada
      orderItems.forEach(item => item.order = savedOrder);
      await queryRunner.manager.save(OrderItem, orderItems);

      // 6. Limpiar Carrito
      await this.cartService.clearCart(userId);

      // 7. Confirmar Transacción
      await queryRunner.commitTransaction();

      // Retornar la orden con sus relaciones cargadas
      return this.findOneOrder(savedOrder.id, userId);

    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Si ya es una de nuestras excepciones, la lanzamos tal cual
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      // Si es un error inesperado, logueamos y lanzamos 500
      console.error('ORDER_CREATION_ERROR:', error);
      throw new InternalServerErrorException('Ocurrió un error inesperado al procesar la compra.');
    } finally {
      await queryRunner.release();
    }
  }

  async findOneOrder(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`La orden #${id} no fue encontrada o no pertenece al usuario.`);
    }
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
