import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { StampService } from './stamp.service';
import { StampController } from './stamp.controller';
import { TestController } from '../test.controller';
import { Business } from './entities/business.entity';
import { Stamp } from './entities/stamp.entity';
import { ClientCard } from '../clients/entities/client-card.entity';
import { Client } from '../clients/entities/client.entity';
import { StampRedemption } from '../clients/entities/stamp-redemption.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      Stamp,
      ClientCard,
      Client,
      StampRedemption,
    ]),
    JwtModule.register({
      secret: new ConfigService().get<string>('JWT_SECRET') || 'secretKey',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [BusinessService, StampService],
  controllers: [BusinessController, StampController, TestController],
  exports: [BusinessService, StampService],
})
export class BusinessModule {}
