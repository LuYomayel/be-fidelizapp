import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { ClientCardController } from './client-card.controller';
import { Client } from './entities/client.entity';
import { ClientCard } from './entities/client-card.entity';
import { StampRedemption } from './entities/stamp-redemption.entity';
import { StampService } from '../business/stamp.service';
import { Business } from '../business/entities/business.entity';
import { Stamp } from '../business/entities/stamp.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      ClientCard,
      StampRedemption,
      Business,
      Stamp,
    ]),
    JwtModule.register({
      secret: new ConfigService().get<string>('JWT_SECRET') || 'secretKey',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [ClientsService, StampService],
  controllers: [ClientsController, ClientCardController],
  exports: [ClientsService],
})
export class ClientsModule {}
