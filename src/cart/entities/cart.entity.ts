import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, user => user.cart)
    @JoinColumn()
    user: User;

    @OneToMany(() => CartItem, item => item.cart, { cascade: true })
    items: CartItem[];
}
