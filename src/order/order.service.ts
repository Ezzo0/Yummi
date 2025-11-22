import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { MenuItem } from '../restaurant/entities/menuItem.entity';
import { OrderItem } from './entities/orderItem.entity';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '../utils/types';

@Injectable()
export class OrderService {
  private stripe: Stripe;
  private readonly frontendUrl: string;
  private readonly webhookSecret: string;

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemsRepository: Repository<MenuItem>,

    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      configService.get<string>('STRIPE_API_KEY') as string,
    );
    this.frontendUrl = configService.get<string>('FRONTEND_URI') as string;
    this.webhookSecret = configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    ) as string;
  }

  findMine(user: number): Promise<Order[]> {
    return this.ordersRepository.find({ where: { user: { id: user } } });
  }

  async createCheckOutSession(
    createOrderDto: CreateOrderDto,
    user: number,
  ): Promise<string> {
    const restaurant = await this.restaurantsRepository.findOneBy({
      id: createOrderDto.restaurantId,
    });

    if (!restaurant) throw new NotFoundException('Restaurant not found');

    // Check for duplicate menu items in the request
    const menuItemIds = createOrderDto.items.map((item) => item.menuItemId);
    const uniqueMenuItemIds = new Set(menuItemIds);
    if (menuItemIds.length !== uniqueMenuItemIds.size) {
      throw new BadRequestException(
        'Duplicate menu items are not allowed. Please combine quantities for the same item.',
      );
    }

    // Validate and fetch all menu items first
    const menuItemsMap = new Map<number, MenuItem>();
    for (const item of createOrderDto.items) {
      const menuItem = await this.menuItemsRepository.findOne({
        where: {
          id: item.menuItemId,
          restaurant: { id: createOrderDto.restaurantId },
        },
      });

      if (!menuItem) {
        throw new NotFoundException(
          `MenuItem with id ${item.menuItemId} not found or does not belong to this restaurant`,
        );
      }

      menuItemsMap.set(item.menuItemId, menuItem);
    }

    // Create line items for Stripe using already fetched menu items
    const lineItems = this.createStripeLineItems(
      createOrderDto.items,
      menuItemsMap,
    );

    // Create Stripe session first (before saving order to DB)
    const tempOrderId = Date.now(); // Temporary ID for metadata
    const session = await this.createStripeSession(
      lineItems,
      tempOrderId,
      restaurant,
    );

    if (!session.url) {
      throw new InternalServerErrorException(
        'Error in stripe session creation',
      );
    }

    // Only save order to DB after successful Stripe session creation
    const newOrder = this.ordersRepository.create({
      restaurant: restaurant,
      user: { id: user } as Order['user'],
    });

    const savedOrder = await this.ordersRepository.save(newOrder);

    // Update session metadata with actual order ID
    try {
      await this.stripe.checkout.sessions.update(session.id, {
        metadata: {
          orderId: savedOrder.id.toString(),
          restaurantId: restaurant.id.toString(),
        },
      });
    } catch (error) {
      // If Stripe update fails, delete the order as it's critical for webhook processing
      // The webhook needs the correct orderId in metadata to find and update the order
      await this.ordersRepository.remove(savedOrder);
      console.error(
        `Failed to update Stripe session metadata for order ${savedOrder.id}. Order deleted:`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to create checkout session. Please try again.',
      );
    }

    // Create and save order items
    const orderItems: OrderItem[] = [];
    for (const item of createOrderDto.items) {
      const menuItem = menuItemsMap.get(item.menuItemId)!;

      const orderItem = this.orderItemsRepository.create({
        order: savedOrder,
        menuItem: menuItem,
        quantity: item.quantity,
      });

      const savedOrderItem = await this.orderItemsRepository.save(orderItem);
      orderItems.push(savedOrderItem);
    }

    return session.url;
  }

  async handleStripeWebhook(
    signature: string,
    rawBody: Buffer,
  ): Promise<{ received: boolean }> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      // Return 400 for signature verification failures (not 500)
      throw new BadRequestException(
        `Webhook signature verification failed: ${err.message}`,
      );
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Extract order ID from metadata
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        throw new InternalServerErrorException(
          'Order ID not found in session metadata',
        );
      }

      // Find and update the order
      const order = await this.ordersRepository.findOne({
        where: { id: parseInt(orderId) },
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${orderId} not found`);
      }

      // Idempotency check: skip if order is already paid
      if (order.status === OrderStatus.PAID) {
        return { received: true };
      }

      // Update order status to PAID and set total amount
      order.status = OrderStatus.PAID;
      if (session.amount_total) {
        // Convert from cents to decimal
        order.totalAmount = session.amount_total / 100;
      }

      await this.ordersRepository.save(order);
    }

    return { received: true };
  }

  private async createStripeSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    orderId: number | string,
    restaurant: Restaurant,
  ): Promise<Stripe.Checkout.Session> {
    const session = await this.stripe.checkout.sessions.create({
      line_items: lineItems,
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'Delivery',
            type: 'fixed_amount',
            fixed_amount: {
              // Convert delivery price to cents (assuming it's stored as decimal)
              amount: Math.round(restaurant.deliveryPrice * 100),
              currency: 'egp',
            },
          },
        },
      ],
      mode: 'payment',
      metadata: {
        orderId: orderId.toString(),
        restaurantId: restaurant.id.toString(),
      },
      success_url: `${this.frontendUrl}/order-status?success=true`,
      cancel_url: `${this.frontendUrl}/detail/${restaurant.id}?cancelled=true`,
    });

    return session;
  }

  private createStripeLineItems(
    items: CreateOrderDto['items'],
    menuItemsMap: Map<number, MenuItem>,
  ): Stripe.Checkout.SessionCreateParams.LineItem[] {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const menuItem = menuItemsMap.get(item.menuItemId);

      if (!menuItem) {
        throw new NotFoundException(
          `MenuItem with id ${item.menuItemId} not found`,
        );
      }

      lineItems.push({
        price_data: {
          currency: 'egp',
          product_data: {
            name: menuItem.name,
          },
          unit_amount: Math.round(menuItem.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      });
    }

    return lineItems;
  }
}
