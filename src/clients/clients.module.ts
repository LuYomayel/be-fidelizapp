import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/client.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { EmailService } from '../common/services/email.service';
import { VerificationCodeService } from '../common/services/verification-code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, VerificationCode]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [ClientsController],
  providers: [ClientsService, EmailService, VerificationCodeService],
  exports: [ClientsService],
})
export class ClientsModule {}
