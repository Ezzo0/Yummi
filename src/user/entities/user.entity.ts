import { Exclude } from 'class-transformer';
import { Restaurant } from '../../restaurant/entities/restaurant.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  addressLine: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurents: Restaurant[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}
