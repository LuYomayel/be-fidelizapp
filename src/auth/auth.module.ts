import { Module, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy, LocalClientStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { PublicAwareJwtAuthGuard } from './public-aware-jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    forwardRef(() => ClientsModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secretKey',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    LocalClientStrategy,
    JwtStrategy,
    GoogleStrategy,
    PublicAwareJwtAuthGuard,
    Reflector,
  ],
  controllers: [AuthController],
  exports: [AuthService, PublicAwareJwtAuthGuard],
})
export class AuthModule {}
