import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  VerificationCode,
  VerificationCodeType,
} from '../../clients/entities/verification-code.entity';

@Injectable()
export class VerificationCodeService {
  constructor(
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
  ) {}

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createVerificationCode(
    email: string,
    type: VerificationCodeType,
    clientId?: number,
  ): Promise<VerificationCode> {
    // Invalidar códigos anteriores del mismo tipo para este email
    await this.verificationCodeRepository.update(
      { email, type, used: false },
      { used: true },
    );

    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expira en 15 minutos

    const verificationCode = this.verificationCodeRepository.create({
      code,
      type,
      email,
      clientId,
      expiresAt,
    });

    return await this.verificationCodeRepository.save(verificationCode);
  }

  async validateCode(
    email: string,
    code: string,
    type: VerificationCodeType,
  ): Promise<{ valid: boolean; message: string }> {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        email,
        code,
        type,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!verificationCode) {
      return {
        valid: false,
        message: 'Código inválido o expirado',
      };
    }

    // Marcar el código como usado
    await this.verificationCodeRepository.update(
      { id: verificationCode.id },
      { used: true },
    );

    return {
      valid: true,
      message: 'Código validado correctamente',
    };
  }

  async hasValidCode(
    email: string,
    type: VerificationCodeType,
  ): Promise<boolean> {
    const count = await this.verificationCodeRepository.count({
      where: {
        email,
        type,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    return count > 0;
  }

  async getLatestCode(
    email: string,
    type: VerificationCodeType,
  ): Promise<VerificationCode | null> {
    return await this.verificationCodeRepository.findOne({
      where: {
        email,
        type,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
