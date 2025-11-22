import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateMenuItemDto } from './dto/create-menuItem.dto';
import { MenuItem } from './entities/menuItem.entity';
import { UpdateMenuItemDto } from './dto/update-menuItem.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(
    createRestaurantDto: CreateRestaurantDto,
    owner: number,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: {
        restaurantName: createRestaurantDto.restaurantName,
        owner: { id: owner },
      },
    });

    if (restaurant) {
      throw new BadRequestException('Restaurant already exists');
    }

    const newRestaurant = this.restaurantsRepository.create({
      ...createRestaurantDto,
      owner: { id: owner } as Restaurant['owner'],
    });
    return this.restaurantsRepository.save(newRestaurant);
  }

  async findAll(
    city?: string,
    searchQuery?: string,
    sortOption:
      | 'name'
      | 'deliveryPrice'
      | 'estimatedDeliveryTime'
      | 'updatedAt' = 'updatedAt',
    page = 1,
    limit = 10,
  ): Promise<Restaurant[]> {
    const qb = this.restaurantsRepository.createQueryBuilder('restaurant');

    if (city) {
      qb.andWhere('LOWER(restaurant.city) = LOWER(:city)', { city });
    }

    if (searchQuery) {
      qb.andWhere(
        '(LOWER(restaurant.restaurantName) LIKE :search OR LOWER(restaurant.city) LIKE :search)',
        { search: `%${searchQuery.toLowerCase()}%` },
      );
    }

    const sortColumnMap = {
      name: 'restaurant.restaurantName',
      deliveryPrice: 'restaurant.deliveryPrice',
      estimatedDeliveryTime: 'restaurant.estimatedDeliveryTime',
      updatedAt: 'restaurant.updatedAt',
    } as const;

    qb.orderBy(sortColumnMap[sortOption] ?? sortColumnMap.name, 'ASC');

    qb.skip((page - 1) * limit).take(limit);

    return qb.getMany();
  }

  findMine(owner: number): Promise<Restaurant[] | null> {
    return this.restaurantsRepository.find({ where: { owner: { id: owner } } });
  }

  findOne(id: number): Promise<Restaurant | null> {
    return this.restaurantsRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateRestaurantDto: UpdateRestaurantDto,
    owner: number,
  ): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (restaurant.owner.id !== owner)
      throw new UnauthorizedException('Access Denied');

    // If password is being updated, hash it
    if (updateRestaurantDto.imageUrl) {
    }

    const savedRestaurant = this.restaurantsRepository.save({
      ...restaurant,
      ...updateRestaurantDto,
    });
    return plainToInstance(Restaurant, savedRestaurant);
  }

  async remove(id: number, owner: number): Promise<void> {
    const restaurant = await this.findOne(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (restaurant.owner.id !== owner)
      throw new UnauthorizedException('Access Denied');
    await this.restaurantsRepository.delete(id);
  }

  async addMenuItem(
    restaurantID: number,
    owner: number,
    createMenuItemDto: CreateMenuItemDto,
  ): Promise<MenuItem> {
    const restaurant = await this.findOne(restaurantID);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (restaurant.owner.id !== owner)
      throw new UnauthorizedException('Access Denied');

    const menuItem = await this.menuItemRepository.findOne({
      where: {
        name: createMenuItemDto.name,
        restaurant: { id: restaurantID },
      },
    });

    if (menuItem) throw new BadRequestException('Menu Item already exists');

    const newMenuItem = this.menuItemRepository.create({
      ...createMenuItemDto,
      // restaurant: restaurant, This is an alternative way
      restaurant: { id: restaurantID } as MenuItem['restaurant'],
    });
    return this.menuItemRepository.save(newMenuItem);
  }

  async updateMenuItem(
    restaurantID: number,
    menuItemID: number,
    owner: number,
    updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    // First, verify the restaurant exists and the user owns it
    const restaurant = await this.findOne(restaurantID);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (restaurant.owner.id !== owner)
      throw new UnauthorizedException('Access Denied');

    // Find the menu item and verify it belongs to this restaurant
    const menuItem = await this.menuItemRepository.findOne({
      where: {
        id: menuItemID,
        restaurant: { id: restaurantID },
      },
    });

    if (!menuItem) throw new NotFoundException('Menu Item not found');

    // If name is being updated, check for duplicates
    if (updateMenuItemDto.name && updateMenuItemDto.name !== menuItem.name) {
      const existingMenuItem = await this.menuItemRepository.findOne({
        where: {
          name: updateMenuItemDto.name,
          restaurant: { id: restaurantID },
        },
      });

      if (existingMenuItem) {
        throw new BadRequestException(
          'Menu Item with this name already exists',
        );
      }
    }

    // Update the menu item
    const updatedMenuItem = this.menuItemRepository.save({
      ...menuItem,
      ...updateMenuItemDto,
    });

    return updatedMenuItem;
  }

  async deleteMenuItem(
    restaurantID: number,
    menuItemID: number,
    owner: number,
  ): Promise<void> {
    // First, verify the restaurant exists and the user owns it
    const restaurant = await this.findOne(restaurantID);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (restaurant.owner.id !== owner)
      throw new UnauthorizedException('Access Denied');

    // Find the menu item and verify it belongs to this restaurant
    const menuItem = await this.menuItemRepository.findOne({
      where: {
        id: menuItemID,
        restaurant: { id: restaurantID },
      },
    });

    if (!menuItem) throw new NotFoundException('Menu Item not found');

    // Delete the menu item
    await this.menuItemRepository.delete(menuItemID);
  }
}
