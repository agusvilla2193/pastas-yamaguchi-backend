import { Controller, Get, Post, Param, Patch, Body, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from './entities/order.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Auth() // Protege todo el controlador con JWT por defecto
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  create(@GetUser('id') userId: number) {
    return this.ordersService.createOrder(userId);
  }

  @Get()
  findAll(@GetUser('id') userId: number) {
    return this.ordersService.findAllUserOrders(userId);
  }

  @Get('all')
  @Auth('admin') // Sobrescribe para pedir rol admin
  findAllAdmin() {
    return this.ordersService.findAllOrders();
  }

  @Patch(':id/status')
  @Auth('admin')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', new ParseEnumPipe(OrderStatus)) status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(id, status);
  }
}
