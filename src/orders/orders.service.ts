import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './order-item.entity';
import { CartService } from '../cart/cart.service';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Preference, MercadoPagoConfig } from 'mercadopago';

interface CreateOrderResponse {
  order: Order;
  init_point: string;
  preferenceId: string; // Agregado para el Modal
}

@Injectable()
export class OrdersService {
  private readonly mpClient: MercadoPagoConfig;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.mpClient = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('MP_ACCESS_TOKEN') || '',
    });
  }

  async createOrder(userId: number): Promise<CreateOrderResponse> {
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

      const order = queryRunner.manager.create(Order, {
        user,
        status: OrderStatus.PENDING,
        total: 0,
      });
      const savedOrder = await queryRunner.manager.save(order);

      let total = 0;
      const orderItems: OrderItem[] = [];
      const itemsForMP = [];

      for (const cartItem of cart.items) {
        const product = await queryRunner.manager.findOneBy(Product, { id: cartItem.product.id });

        if (!product || product.stock < cartItem.quantity) {
          throw new BadRequestException(`Stock insuficiente para: ${product?.name || 'Producto'}`);
        }

        product.stock -= cartItem.quantity;
        await queryRunner.manager.save(product);

        const orderItem = queryRunner.manager.create(OrderItem, {
          product,
          quantity: cartItem.quantity,
          priceAtPurchase: product.price,
          order: savedOrder,
        });

        orderItems.push(orderItem);
        total += Number(product.price) * cartItem.quantity;

        itemsForMP.push({
          id: product.id.toString(),
          title: product.name,
          unit_price: Number(product.price),
          quantity: cartItem.quantity,
          currency_id: 'ARS',
        });
      }

      savedOrder.total = total;
      await queryRunner.manager.save(savedOrder);
      await queryRunner.manager.save(orderItems);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const preference = new Preference(this.mpClient);

      const mpResponse = await preference.create({
        body: {
          items: itemsForMP,
          back_urls: {
            success: `${frontendUrl}/checkout/success`,
            failure: `${frontendUrl}/cart`,
            pending: `${frontendUrl}/orders`,
          },
          auto_return: 'approved',
          external_reference: savedOrder.id.toString(),
        },
      });

      await this.cartService.clearCart(userId);
      await queryRunner.commitTransaction();

      const finalOrder = await this.findOneOrder(savedOrder.id, userId);

      return {
        order: finalOrder,
        init_point: mpResponse.init_point || '',
        preferenceId: mpResponse.id || '', // Retornamos el ID para el Modal
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      console.error('MP Error:', error);
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
