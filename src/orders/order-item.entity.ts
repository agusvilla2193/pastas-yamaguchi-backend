import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Order } from './entities/order.entity';


@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    priceAtPurchase: number; // Precio al momento de la compra

    // El ítem está relacionado a un Producto, pero no es la fuente principal de datos
    @ManyToOne(() => Product)
    product: Product;

    // El ítem pertenece a una Orden (relación N:1)
    @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
    order: Order;
}
