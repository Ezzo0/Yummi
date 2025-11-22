import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUserGuard } from './guards/authUser.guard';
import { User } from './decorators/current-user.decorator';
import type { JWTPayloadType } from '../utils/types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthUserGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @UseGuards(AuthUserGuard)
  findOne(@User() tokenPayload: JWTPayloadType) {
    return this.userService.findOne(tokenPayload.id);
  }

  @Patch('update-profile')
  @UseGuards(AuthUserGuard)
  update(
    @User() tokenPayload: JWTPayloadType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(tokenPayload.id, updateUserDto);
  }

  @Delete('delete-account')
  @UseGuards(AuthUserGuard)
  remove(@User() tokenPayload: JWTPayloadType) {
    return this.userService.remove(tokenPayload.id);
  }
}
