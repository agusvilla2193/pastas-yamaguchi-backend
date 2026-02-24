import {
  Controller, Get, Post, Param, UseGuards,
  HttpCode, HttpStatus, Patch, Body, ParseIntPipe, BadRequestException
} from '@nestjs/common';
import { OrdersService, OrderStatus } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Order } from './entities/order.entity';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAllAdmin(): Promise<Order[]> {
    return this.ordersService.findAllOrders();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetUser('id') userId: number): Promise<Order> {
    return this.ordersService.createOrder(userId);
  }

  @Get()
  async findAll(@GetUser('id') userId: number): Promise<Order[]> {
    return this.ordersService.findAllUserOrders(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number
  ): Promise<Order> {
    return this.ordersService.findOneOrder(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string
  ): Promise<Order> {
    const validStatuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'];

    if (!validStatuses.includes(status as OrderStatus)) {
      throw new BadRequestException(`Estado no válido. Los estados permitidos son: ${validStatuses.join(', ')}`);
    }

    return this.ordersService.updateOrderStatus(id, status as OrderStatus);
  }
}
