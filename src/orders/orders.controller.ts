import { Controller, Get, Post, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get('all')
  findAllAdmin() {
    return this.ordersService.findAllOrders();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@GetUser('userId') userId: number) {
    return this.ordersService.createOrder(userId);
  }

  @Get()
  findAll(@GetUser('userId') userId: number) {
    return this.ordersService.findAllUserOrders(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('userId') userId: number) {
    return this.ordersService.findOneOrder(+id, userId);
  }
}
