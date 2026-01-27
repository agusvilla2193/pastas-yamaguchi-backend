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
        private readonly cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private readonly cartItemRepository: Repository<CartItem>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    /**
     * Busca el carrito del usuario. Si no existe, lo crea automáticamente.
     */
    async findCartByUserId(userId: number): Promise<Cart> {
        const cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['items', 'items.product'], // No necesitamos 'user' aquí normalmente
        });

        if (!cart) {
            return this.createEmptyCart(userId);
        }
        return cart;
    }

    /**
     * Crea un nuevo carrito vacío para un usuario.
     */
    private async createEmptyCart(userId: number): Promise<Cart> {
        // Usamos el ID del usuario directamente en la relación
        const cart = this.cartRepository.create({ user: { id: userId } });
        const savedCart = await this.cartRepository.save(cart);

        // Devolvemos el carrito con el array de ítems inicializado para evitar errores de undefined
        return { ...savedCart, items: [] };
    }

    /**
     * Vacía el carrito del usuario eliminando todos sus ítems.
     */
    async clearCart(userId: number): Promise<void> {
        const cart = await this.findCartByUserId(userId);

        if (cart.items && cart.items.length > 0) {
            // Eliminación masiva de ítems asociados a este carrito
            await this.cartItemRepository.delete({ cart: { id: cart.id } });
        }
    }

    /**
     * Añade un producto al carrito o incrementa su cantidad si ya existe.
     */
    async addItemToCart(userId: number, addItemDto: AddItemDto): Promise<Cart> {
        const { productId, quantity } = addItemDto;
        const cart = await this.findCartByUserId(userId);

        const product = await this.productRepository.findOneBy({ id: productId });
        if (!product) {
            throw new NotFoundException(`Producto con ID ${productId} no encontrado.`);
        }

        // Buscamos si el producto ya está en el carrito
        const existingItem = cart.items.find(item => item.product.id === productId);

        if (existingItem) {
            // Actualizamos cantidad
            existingItem.quantity += quantity;
            await this.cartItemRepository.save(existingItem);
        } else {
            // Creamos nuevo ítem de carrito
            const newItem = this.cartItemRepository.create({
                cart: cart,
                product: product,
                quantity: quantity,
            });
            await this.cartItemRepository.save(newItem);
        }

        // Retornamos el carrito actualizado con las relaciones frescas
        return this.findCartByUserId(userId);
    }
}
