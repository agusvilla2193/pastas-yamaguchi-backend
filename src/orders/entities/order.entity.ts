import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from '../order-item.entity';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    orderDate: Date;

    @Column({ default: 'PENDING' }) // PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
    status: string;

    @Column('decimal', { precision: 10, scale: 2 }) // Total de la orden
    total: number;

    // Una orden pertenece a un solo Usuario (relación N:1)
    @ManyToOne(() => User, user => user.orders)
    user: User;

    // Una orden tiene múltiples ítems (relación 1:N)
    @OneToMany(() => OrderItem, item => item.order, { cascade: true })
    items: OrderItem[];
}
