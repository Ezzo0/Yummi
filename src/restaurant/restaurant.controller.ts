import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { AuthUserGuard } from '../user/guards/authUser.guard';
import { User } from '../user/decorators/current-user.decorator';
import type { JWTPayloadType } from '../utils/types';
import { CreateMenuItemDto } from './dto/create-menuItem.dto';
import { UpdateMenuItemDto } from './dto/update-menuItem.dto';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @UseGuards(AuthUserGuard)
  create(
    @User() tokenPayload: JWTPayloadType,
    @Body() createRestaurantDto: CreateRestaurantDto,
  ) {
    return this.restaurantService.create(createRestaurantDto, tokenPayload.id);
  }

  @Get()
  findAll(
    @Query('city') city: string,
    @Query('searchQuery') SearchQuery: string,
    @Query('sortOption')
    sortOption:
      | 'name'
      | 'deliveryPrice'
      | 'estimatedDeliveryTime'
      | 'updatedAt',
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
  ) {
    return this.restaurantService.findAll(
      city,
      SearchQuery,
      sortOption,
      page,
      limit,
    );
  }

  @Get('my-restaurants')
  @UseGuards(AuthUserGuard)
  findMine(@User() tokenPayload: JWTPayloadType) {
    return this.restaurantService.findMine(tokenPayload.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthUserGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @User() tokenPayload: JWTPayloadType,
  ) {
    return this.restaurantService.update(
      id,
      updateRestaurantDto,
      tokenPayload.id,
    );
  }

  @Delete(':id')
  @UseGuards(AuthUserGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @User() tokenPayload: JWTPayloadType,
  ) {
    return this.restaurantService.remove(id, tokenPayload.id);
  }

  @Post('menu/:restaurantID')
  @UseGuards(AuthUserGuard)
  addMenuItem(
    @Param('restaurantID', ParseIntPipe) restaurantID: number,
    @User() tokenPayload: JWTPayloadType,
    @Body() createMenuItemDto: CreateMenuItemDto,
  ) {
    return this.restaurantService.addMenuItem(
      restaurantID,
      tokenPayload.id,
      createMenuItemDto,
    );
  }

  @Patch('menu/:restaurantID/:menuItemID')
  @UseGuards(AuthUserGuard)
  updateMenuItem(
    @Param('restaurantID', ParseIntPipe) restaurantID: number,
    @Param('menuItemID', ParseIntPipe) menuItemID: number,
    @User() tokenPayload: JWTPayloadType,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.restaurantService.updateMenuItem(
      restaurantID,
      menuItemID,
      tokenPayload.id,
      updateMenuItemDto,
    );
  }

  @Delete('menu/:restaurantID/:menuItemID')
  @UseGuards(AuthUserGuard)
  deleteMenuItem(
    @Param('restaurantID', ParseIntPipe) restaurantID: number,
    @Param('menuItemID', ParseIntPipe) menuItemID: number,
    @User() tokenPayload: JWTPayloadType,
  ) {
    return this.restaurantService.deleteMenuItem(
      restaurantID,
      menuItemID,
      tokenPayload.id,
    );
  }
}
