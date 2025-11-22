import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { AccessJwtModule } from '../jwt/access/access-jwt.module';
import { Restaurant } from './entities/restaurant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menuItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, MenuItem]), AccessJwtModule],
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}
