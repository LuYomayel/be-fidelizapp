import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientCard } from './entities/client-card.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { StampRedemption } from './entities/stamp-redemption.entity';
import { Stamp } from '../business/entities/stamp.entity';
import { RewardRedemption } from '../business/entities/reward-redemption.entity';
import { Business } from '../business/entities/business.entity';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientCardController } from './client-card.controller';
import { ClientProfileController } from './profile.controller';
import { ClientProfileService } from './client-profile.service';
import { BusinessModule } from '../business/business.module';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from '../common/services/email.service';
import { VerificationCodeService } from '../common/services/verification-code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      ClientCard,
      VerificationCode,
      StampRedemption,
      Stamp,
      RewardRedemption,
      Business,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    BusinessModule,
    forwardRef(() => AuthModule),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [
    ClientsController,
    ClientCardController,
    ClientProfileController,
  ],
  providers: [
    ClientsService,
    ClientProfileService,
    EmailService,
    VerificationCodeService,
  ],
  exports: [ClientsService, ClientProfileService],
})
export class ClientsModule {}
