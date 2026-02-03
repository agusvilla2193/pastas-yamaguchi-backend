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

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    zipCode: string;

    @Column({ default: 'user' })
    role: string;

    @Column({ default: false })
    isActive: boolean;

    @Column({ nullable: true })
    confirmationToken: string;

    @Column({ nullable: true })
    resetPasswordToken: string;

    @Column({ type: 'timestamp', nullable: true })
    resetPasswordExpires: Date;

    @OneToMany(() => Order, (order) => order.user, { cascade: true })
    orders: Order[];

    @OneToOne(() => Cart, cart => cart.user, { cascade: true })
    cart: Cart;
}
