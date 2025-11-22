import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { AccessJwtModule } from '../jwt/access/access-jwt.module';
import { RefreshJwtModule } from '../jwt/refresh/refresh-jwt.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, AccessJwtModule, RefreshJwtModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
