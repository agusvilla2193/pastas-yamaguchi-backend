import { CartItem } from 'src/cart/entities/cart-item.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    price: number;

    @Column({ default: 100, type: 'int' })
    stock: number;

    @OneToMany(() => CartItem, item => item.product)
    cartItems: CartItem[];
}
