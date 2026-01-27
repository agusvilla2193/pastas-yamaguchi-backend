import {
  Controller, Get, Post, Param, UseGuards,
  HttpCode, HttpStatus, Patch, Body, ParseIntPipe
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Order } from './entities/order.entity';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  // 1. Solo ADMIN puede ver TODAS las órdenes del sistema
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAllAdmin(): Promise<Order[]> {
    return this.ordersService.findAllOrders();
  }

  // 2. Crear orden a partir del carrito del usuario logueado
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetUser('id') userId: number): Promise<Order> {
    return this.ordersService.createOrder(userId);
  }

  // 3. El usuario ve sus propias órdenes
  @Get()
  async findAll(@GetUser('id') userId: number): Promise<Order[]> {
    return this.ordersService.findAllUserOrders(userId);
  }

  // 4. Ver detalle de una orden específica (validando que sea del usuario)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number
  ): Promise<Order> {
    return this.ordersService.findOneOrder(id, userId);
  }

  // 5. Actualizar estado (Ruta de ADMIN)
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(id, status);
  }
}
