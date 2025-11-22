import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { AccessJwtModule } from '../jwt/access/access-jwt.module';
import { ConfigModule } from '@nestjs/config';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { MenuItem } from '../restaurant/entities/menuItem.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Restaurant, MenuItem, User]),
    AccessJwtModule,
    ConfigModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
