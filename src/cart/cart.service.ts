import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
            relations: ['items', 'items.product'],
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
        const cart = this.cartRepository.create({ user: { id: userId } });
        const savedCart = await this.cartRepository.save(cart);
        // Inicializamos items como array vacío para consistencia en el frontend
        savedCart.items = [];
        return savedCart;
    }

    /**
     * Vacía el carrito del usuario eliminando todos sus ítems.
     */
    async clearCart(userId: number): Promise<void> {
        const cart = await this.findCartByUserId(userId);
        if (cart.items && cart.items.length > 0) {
            await this.cartItemRepository.delete({ cart: { id: cart.id } });
        }
    }

    /**
     * Añade un producto al carrito o incrementa su cantidad.
     * Incluye validación de stock preventiva.
     */
    async addItemToCart(userId: number, addItemDto: AddItemDto): Promise<Cart> {
        const { productId, quantity } = addItemDto;

        // 1. Validar existencia del producto
        const product = await this.productRepository.findOneBy({ id: productId });
        if (!product) {
            throw new NotFoundException(`Producto con ID ${productId} no encontrado.`);
        }

        // 2. Validar stock (UX: No permitimos añadir más de lo que hay)
        if (product.stock < quantity) {
            throw new BadRequestException(`Stock insuficiente. Solo quedan ${product.stock} unidades.`);
        }

        const cart = await this.findCartByUserId(userId);

        // 3. Buscar si el producto ya está en el carrito
        const existingItem = cart.items.find(item => item.product.id === productId);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            // Validar stock total (existente + nuevo)
            if (product.stock < newQuantity) {
                throw new BadRequestException(`No puedes añadir esa cantidad. Total en carrito superaría el stock disponible.`);
            }

            existingItem.quantity = newQuantity;
            await this.cartItemRepository.save(existingItem);
        } else {
            // 4. Crear nuevo ítem
            const newItem = this.cartItemRepository.create({
                cart: cart,
                product: product,
                quantity: quantity,
            });
            await this.cartItemRepository.save(newItem);
        }

        // Retornamos el carrito actualizado
        return this.findCartByUserId(userId);
    }
}
