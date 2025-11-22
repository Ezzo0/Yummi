import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  restaurantName: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  @Min(0)
  deliveryPrice: number;

  @IsNumber()
  @Min(0)
  estimatedDeliveryTime: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  imageUrl?: string;
}
