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

    async findCartByUserId(userId: number): Promise<Cart> {
        const cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['items', 'items.product'],
        });

        return cart || this.createEmptyCart(userId);
    }

    private async createEmptyCart(userId: number): Promise<Cart> {
        const cart = this.cartRepository.create({ user: { id: userId } });
        const savedCart = await this.cartRepository.save(cart);
        savedCart.items = []; // Consistencia para el frontend
        return savedCart;
    }

    async clearCart(userId: number): Promise<void> {
        const cart = await this.findCartByUserId(userId);
        if (cart.items && cart.items.length > 0) {
            await this.cartItemRepository.delete({ cart: { id: cart.id } });
        }
    }

    async addItemToCart(userId: number, addItemDto: AddItemDto): Promise<Cart> {
        const { productId, quantity } = addItemDto;

        const product = await this.productRepository.findOneBy({ id: productId });
        if (!product) throw new NotFoundException(`Producto #${productId} no encontrado.`);

        if (product.stock < quantity) {
            throw new BadRequestException(`Solo quedan ${product.stock} unidades disponibles.`);
        }

        const cart = await this.findCartByUserId(userId);
        const existingItem = cart.items.find(item => item.product.id === productId);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (product.stock < newQuantity) {
                throw new BadRequestException(`No puedes añadir más. Supera el stock disponible.`);
            }
            existingItem.quantity = newQuantity;
            await this.cartItemRepository.save(existingItem);
        } else {
            const newItem = this.cartItemRepository.create({
                cart,
                product,
                quantity,
            });
            await this.cartItemRepository.save(newItem);
        }

        // Refrescar relaciones antes de devolver
        return this.findCartByUserId(userId);
    }
}
