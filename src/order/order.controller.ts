import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import type { JWTPayloadType } from '../utils/types';
import { User } from '../user/decorators/current-user.decorator';
import { AuthUserGuard } from 'src/user/guards/authUser.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @UseGuards(AuthUserGuard)
  findMine(@User() tokenPayload: JWTPayloadType) {
    return this.orderService.findMine(tokenPayload.id);
  }

  @Post('create-checkout-session')
  @UseGuards(AuthUserGuard)
  createCheckOutSession(
    @Body() createOrderDto: CreateOrderDto,
    @User() tokenPayload: JWTPayloadType,
  ) {
    return this.orderService.createCheckOutSession(
      createOrderDto,
      tokenPayload.id,
    );
  }

  @Post('/checkout/webhook')
  @HttpCode(HttpStatus.OK)
  async webHookHandler(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // Validate signature and rawBody exist
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!req.rawBody) {
      throw new BadRequestException('Missing request body');
    }

    return this.orderService.handleStripeWebhook(
      signature,
      req.rawBody as Buffer,
    );
  }
}
