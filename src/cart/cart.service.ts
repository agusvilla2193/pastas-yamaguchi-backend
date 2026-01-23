import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddItemDto } from './dto/add-item.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private cartItemRepository: Repository<CartItem>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    // METODO 1: findCartByUserId (Llamado en OrdersService)
    async findCartByUserId(userId: number): Promise<Cart> {
        const cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user', 'items', 'items.product'],
        });

        if (!cart) {
            // Opción 1: Lanza un error si el carrito no existe
            // throw new NotFoundException('Cart not found for user'); 

            // Opción 2 (Mejor para este caso): Crea el carrito si no existe
            return this.createEmptyCart(userId);
        }
        return cart;
    }

    // Método auxiliar para crear un carrito (usado arriba)
    private async createEmptyCart(userId: number): Promise<Cart> {
        const cart = this.cartRepository.create({ user: { id: userId } });
        return this.cartRepository.save(cart);
    }

    // METODO 2: clearCart (Llamado en OrdersService)
    async clearCart(userId: number): Promise<void> {
        const cart = await this.findCartByUserId(userId);

        if (cart && cart.items && cart.items.length > 0) {
            // Opción más robusta: Borramos los ítems directamente por su relación con el ID del carrito
            await this.cartItemRepository.delete({ cart: { id: cart.id } });

        }
    }

    // METODO 3: addItemToCart (Usado por CartController)
    // ESTE TAMBIÉN DEBE EXISTIR PARA QUE EL MÓDULO FUNCIONE
    async addItemToCart(userId: number, addItemDto: AddItemDto): Promise<Cart> {
        const { productId, quantity } = addItemDto;
        const cart = await this.findCartByUserId(userId);
        const product = await this.productRepository.findOneBy({ id: productId });

        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found.`);
        }

        let cartItem = cart.items.find(item => item.product.id === productId);

        if (cartItem) {
            cartItem.quantity += quantity;
            await this.cartItemRepository.save(cartItem);
        } else {
            cartItem = this.cartItemRepository.create({
                cart: cart,
                product: product,
                quantity: quantity,
            });
            await this.cartItemRepository.save(cartItem);
        }
        // Devolvemos el carrito actualizado (recargándolo para tener los ítems correctos)
        return this.findCartByUserId(userId);
    }
}
