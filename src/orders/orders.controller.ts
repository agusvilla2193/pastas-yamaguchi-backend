import { Controller, Get, Post, Param, UseGuards, Patch, Body, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
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
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAllAdmin() {
    return this.ordersService.findAllOrders();
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', new ParseEnumPipe(OrderStatus)) status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(id, status);
  }
}
