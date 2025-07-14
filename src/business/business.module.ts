import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { StampService } from './stamp.service';
import { StampController } from './stamp.controller';
import { RewardService } from './reward.service';
import { RewardController } from './reward.controller';
import { StampConfigService } from './stamp-config.service';
import { StampConfigController } from './stamp-config.controller';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TestController } from '../test.controller';
import { Business } from './entities/business.entity';
import { Stamp } from './entities/stamp.entity';
import { Reward } from './entities/reward.entity';
import { RewardRedemption } from './entities/reward-redemption.entity';
import { StampConfig } from './entities/stamp-config.entity';
import { StampRule } from './entities/stamp-rule.entity';
import { Employee } from './entities/employee.entity';
import { ClientCard } from '../clients/entities/client-card.entity';
import { Client } from '../clients/entities/client.entity';
import { StampRedemption } from '../clients/entities/stamp-redemption.entity';

import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      Stamp,
      Reward,
      RewardRedemption,
      StampConfig,
      StampRule,
      Employee,
      ClientCard,
      Client,
      StampRedemption,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  providers: [
    BusinessService,
    StampService,
    RewardService,
    StampConfigService,
    EmployeeService,
    ProfileService,
  ],
  controllers: [
    BusinessController,
    StampController,
    RewardController,
    StampConfigController,
    EmployeeController,
    TestController,
    ProfileController,
  ],
  exports: [
    BusinessService,
    StampService,
    RewardService,
    StampConfigService,
    EmployeeService,
    ProfileService,
    TypeOrmModule, // Exportar TypeOrmModule para que otros módulos puedan usar los repositorios
  ],
})
export class BusinessModule {}
