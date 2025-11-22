import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { MenuItem } from './menuItem.entity';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../order/entities/order.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurantName: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  deliveryPrice: number;

  @Column()
  estimatedDeliveryTime: number;

  @Column({ nullable: true, type: 'varchar' })
  imageUrl: string | null;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant, { eager: true })
  menu: MenuItem[];

  @ManyToOne(() => User, (user) => user.restaurents, { eager: true })
  owner: User;

  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}
