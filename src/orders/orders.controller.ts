import { Controller, Get, Post, Param, Patch, Body, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

interface CreateOrderResponse {
  order: Order;
  init_point: string;
  preferenceId: string;
}

@Auth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  create(@GetUser('id') userId: number): Promise<CreateOrderResponse> {
    return this.ordersService.createOrder(userId);
  }

  @Get()
  findAll(@GetUser('id') userId: number): Promise<Order[]> {
    return this.ordersService.findAllUserOrders(userId);
  }

  @Get('all')
  @Auth('admin')
  findAllAdmin(): Promise<Order[]> {
    return this.ordersService.findAllOrders();
  }

  @Patch(':id/status')
  @Auth('admin')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', new ParseEnumPipe(OrderStatus)) status: OrderStatus,
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(id, status);
  }
}
