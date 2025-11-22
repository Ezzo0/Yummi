import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ACCESS_JWT } from '../../utils/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: '15m',
        }, // short-lived
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: ACCESS_JWT,
      useExisting: JwtService, // use the JwtService created by JwtModule
    },
  ],
  exports: [ACCESS_JWT],
})
export class AccessJwtModule {}
