import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from '../order-item.entity';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    orderDate: Date;

    @Column({ default: 'PENDING' })
    status: string;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @ManyToOne(() => User, user => user.orders, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => OrderItem, item => item.order, { cascade: true })
    items: OrderItem[];
}
