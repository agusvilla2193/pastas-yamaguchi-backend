// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { Product } from '../products/entities/product.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Cart, CartItem, Product]),
        UsersModule,
        ProductsModule,
    ],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService], // <--- ¡CLAVE! Esto lo hace disponible para OrdersModule.
})
export class CartModule { }
