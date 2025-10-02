import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './order-item.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartModule } from '../cart/cart.module'; // Para obtener el carrito
import { ProductsModule } from '../products/products.module'; // Para actualizar stock
import { Product } from '../products/entities/product.entity'; // Entidad de Producto

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
    CartModule,
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule { }
