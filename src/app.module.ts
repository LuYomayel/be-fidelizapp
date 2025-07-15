import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { ClientsModule } from './clients/clients.module';
import { Business } from './business/entities/business.entity';
import { Client } from './clients/entities/client.entity';
import { Stamp } from './business/entities/stamp.entity';
import { Reward } from './business/entities/reward.entity';
import { RewardRedemption } from './business/entities/reward-redemption.entity';
import { Employee } from './business/entities/employee.entity';
import { ClientCard } from './clients/entities/client-card.entity';
import { StampRedemption } from './clients/entities/stamp-redemption.entity';
import { VerificationCode } from './clients/entities/verification-code.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: parseInt(configService.get<string>('DB_PORT') || '3306'),
          username: configService.get<string>('DB_USERNAME') || 'root',
          password: configService.get<string>('DB_PASSWORD') || 'password',
          database: configService.get<string>('DB_NAME') || 'stampia',
          entities: [
            Business,
            Client,
            Stamp,
            Reward,
            RewardRedemption,
            Employee,
            ClientCard,
            StampRedemption,
            VerificationCode,
          ],
          synchronize: true, // Solo para desarrollo
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    BusinessModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
