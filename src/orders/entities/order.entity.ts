import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from '../order-item.entity';

// 1. Definimos el Enum aquí mismo para que sea la única fuente de verdad
export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    CANCELLED = 'CANCELLED',
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    orderDate: Date;

    // 2. Cambiamos 'string' por el Enum y especificamos el tipo en la DB
    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    // Nota técnica: Se usa 'transformer' para asegurar que el string de la DB vuelva como número al código
    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value)
        }
    })
    total: number;

    @ManyToOne(() => User, user => user.orders, { onDelete: 'CASCADE' })
    user: User;

    @OneToMany(() => OrderItem, item => item.order, { cascade: true })
    items: OrderItem[];
}
