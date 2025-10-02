import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Cart } from './cart.entity';

@Entity()
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 1 })
    quantity: number;

    @ManyToOne(() => Product, product => product.cartItems)
    product: Product;

    @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
    cart: Cart;
}
