import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ACCESS_JWT, REFRESH_JWT } from 'src/utils/constants';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @Inject(ACCESS_JWT) private readonly accessJWT: JwtService,
    @Inject(REFRESH_JWT) private readonly refreshJWT: JwtService,
  ) {}

  async signUp(
    signUpDto: CreateUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const newUser = await this.userService.create(signUpDto);
    const payload: JWTPayloadType = { id: newUser.id, email: newUser.email };
    return {
      access_token: await this.accessJWT.signAsync(payload),
      refresh_token: await this.refreshJWT.signAsync(payload),
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) throw new BadRequestException('Invalid email or password');

    const isPasswordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordMatch)
      throw new BadRequestException('Invalid email or password');

    const payload: JWTPayloadType = { id: user.id, email: user.email };
    return {
      access_token: await this.accessJWT.signAsync(payload),
      refresh_token: await this.refreshJWT.signAsync(payload),
    };
  }

  async refreshToken(
    payload: JWTPayloadType,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userService.findOne(payload.id);
    if (!user) throw new UnauthorizedException('Invalid Token');
    const newPayload: JWTPayloadType = { id: user.id, email: user.email };
    return {
      access_token: await this.accessJWT.signAsync(newPayload),
      refresh_token: await this.refreshJWT.signAsync(newPayload),
    };
  }
}
