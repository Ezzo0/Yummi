import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsInt,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsInt()
  @Min(1)
  menuItemId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  restaurantId: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'Items array cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
