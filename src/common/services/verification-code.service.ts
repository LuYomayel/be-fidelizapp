import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../../business/entities/business.entity';
import {
  VerificationCode,
  VerificationCodeType,
} from '../../clients/entities/verification-code.entity';
import { EmailService } from './email.service';

@Injectable()
export class VerificationCodeService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
    private emailService: EmailService,
  ) {}

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateAndSendVerificationCode(
    business: Business,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Actualizar el negocio con el código de verificación
      await this.businessRepository.update(business.id, {
        emailVerificationCode: code,
        emailVerificationCodeExpiry: expiresAt,
      });

      // Enviar email de verificación
      const emailResult = await this.emailService.sendBusinessVerificationEmail(
        business.email,
        code,
        business.businessName,
        business.adminFirstName,
      );
      console.log('emailResult', emailResult);
      return emailResult;
    } catch (error) {
      console.error('Error generating and sending verification code:', error);
      return {
        success: false,
        message: 'Error al generar y enviar el código de verificación',
      };
    }
  }

  async verifyCode(
    email: string,
    code: string,
  ): Promise<{ success: boolean; message: string; business?: Business }> {
    const business = await this.businessRepository.findOne({
      where: { email },
    });

    if (!business) {
      return { success: false, message: 'Negocio no encontrado' };
    }

    if (business.emailVerified) {
      return { success: false, message: 'El email ya está verificado' };
    }

    if (!business.emailVerificationCode) {
      return {
        success: false,
        message: 'No hay código de verificación pendiente',
      };
    }

    if (business.emailVerificationCode !== code) {
      return { success: false, message: 'Código de verificación inválido' };
    }

    if (
      business.emailVerificationCodeExpiry &&
      business.emailVerificationCodeExpiry < new Date()
    ) {
      return {
        success: false,
        message: 'El código de verificación ha expirado',
      };
    }

    // Marcar como verificado y limpiar el código
    await this.businessRepository.update(business.id, {
      emailVerified: true,
      emailVerificationCode: undefined,
      emailVerificationCodeExpiry: undefined,
    });

    // Obtener el negocio actualizado
    const updatedBusiness = await this.businessRepository.findOne({
      where: { email },
    });

    return {
      success: true,
      message: 'Email verificado exitosamente',
      business: updatedBusiness || undefined,
    };
  }

  async resendVerificationCode(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const business = await this.businessRepository.findOne({
      where: { email },
    });

    if (!business) {
      return { success: false, message: 'Negocio no encontrado' };
    }

    if (business.emailVerified) {
      return { success: false, message: 'El email ya está verificado' };
    }

    return this.generateAndSendVerificationCode(business);
  }

  async createVerificationCode(
    email: string,
    type: VerificationCodeType,
    clientId?: number,
  ): Promise<VerificationCode> {
    // Invalidar todos los códigos anteriores del mismo tipo y email
    await this.verificationCodeRepository.update(
      {
        email,
        type,
        used: false,
      },
      {
        used: true, // Marcar como usado para invalidarlos
      },
    );

    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

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
      },
    });

    if (!verificationCode) {
      return {
        valid: false,
        message: 'Código de verificación inválido',
      };
    }

    if (verificationCode.expiresAt < new Date()) {
      return {
        valid: false,
        message: 'El código de verificación ha expirado',
      };
    }

    // Marcar el código como usado
    await this.verificationCodeRepository.update(verificationCode.id, {
      used: true,
    });

    return {
      valid: true,
      message: 'Código verificado correctamente',
    };
  }

  async createBusinessVerificationCode(
    email: string,
    type: VerificationCodeType,
    businessId?: number,
  ): Promise<VerificationCode> {
    // Invalidar todos los códigos anteriores del mismo tipo y email
    await this.verificationCodeRepository.update(
      {
        email,
        type,
        used: false,
      },
      {
        used: true, // Marcar como usado para invalidarlos
      },
    );

    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const verificationCode = this.verificationCodeRepository.create({
      code,
      type,
      email,
      businessId, // Usar businessId en lugar de clientId
      expiresAt,
    });

    return await this.verificationCodeRepository.save(verificationCode);
  }

  async generateAndSendBusinessPasswordResetCode(
    business: Business,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const verificationCode = await this.createBusinessVerificationCode(
        business.email,
        VerificationCodeType.PASSWORD_RESET,
        business.id,
      );

      // Enviar email de recuperación de contraseña
      const emailResult = await this.emailService.sendPasswordResetEmail(
        business.email,
        verificationCode.code,
        business.adminFirstName,
      );

      return emailResult;
    } catch (error) {
      console.error('Error generating and sending password reset code:', error);
      return {
        success: false,
        message: 'Error al generar y enviar el código de recuperación',
      };
    }
  }
}
