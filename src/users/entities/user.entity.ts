import { Cart } from 'src/cart/entities/cart.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ default: 'user' }) // Puedes usar 'admin', 'user', etc.
    role: string;

    @OneToMany(() => Order, order => order.user)
    orders: Order[];

    @OneToOne(() => Cart, cart => cart.user)
    cart: Cart;
}
