import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { REFRESH_JWT } from '../../utils/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_REFRESH_SECRET'),
        signOptions: { expiresIn: '7d' }, // long-lived
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: REFRESH_JWT,
      useExisting: JwtService, // use the JwtService created by JwtModule
    },
  ],
  exports: [REFRESH_JWT],
})
export class RefreshJwtModule {}
