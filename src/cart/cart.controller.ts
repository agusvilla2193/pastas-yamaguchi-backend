import { Controller, Get, Post, Body, UseGuards, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto'; // Asegurate de que este DTO exista en src/cart/dto/
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard) // <--- Protege TODOS los endpoints del carrito
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    // El decorador @GetUser('userId') extrae el ID del usuario del token JWT
    getCart(@GetUser('id') userId: number) {
        return this.cartService.findCartByUserId(userId);
    }

    @Post('add')
    addItemToCart(@GetUser('id') userId: number, @Body() addItemDto: AddItemDto) {
        return this.cartService.addItemToCart(userId, addItemDto);
    }

    // Endpoint para vaciar el carrito
    @Delete('clear')
    clearCart(@GetUser('id') userId: number) {
        return this.cartService.clearCart(userId);
    }
}
