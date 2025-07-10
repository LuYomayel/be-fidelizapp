import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import {
  IBusinessProfile,
  IUpdateBusinessProfileDto,
  IChangePasswordDto,
  IBusinessQRData,
  IBusinessSettings,
} from '@shared';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async getBusinessProfile(businessId: number): Promise<IBusinessProfile> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return {
      id: business.id,
      businessName: business.businessName,
      email: business.email,
      internalPhone: business.internalPhone,
      externalPhone: business.externalPhone,
      size: business.size,
      street: business.street,
      neighborhood: business.neighborhood,
      postalCode: business.postalCode,
      province: business.province,
      logoPath: business.logoPath,
      type: business.type,
      instagram: business.instagram,
      tiktok: business.tiktok,
      website: business.website,
      stampsForReward: business.stampsForReward,
      rewardDescription: business.rewardDescription,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    };
  }

  async updateBusinessProfile(
    businessId: number,
    updateData: IUpdateBusinessProfileDto,
  ): Promise<IBusinessProfile> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Validar email único si se está actualizando
    if (updateData.email && updateData.email !== business.email) {
      const existingBusiness = await this.businessRepository.findOne({
        where: { email: updateData.email },
      });
      if (existingBusiness) {
        throw new BadRequestException('El email ya está en uso');
      }
    }

    // Actualizar campos
    Object.assign(business, updateData);
    business.updatedAt = new Date();

    await this.businessRepository.save(business);

    return this.getBusinessProfile(businessId);
  }

  async updateBusinessLogo(
    businessId: number,
    file: Express.Multer.File,
  ): Promise<IBusinessProfile> {
    try {
      if (!file) {
        throw new BadRequestException('No se proporcionó archivo de logo');
      }

      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });

      if (!business) {
        throw new NotFoundException('Negocio no encontrado');
      }

      // Eliminar logo anterior si existe
      if (business.logoPath) {
        const oldLogoPath = path.join(process.cwd(), business.logoPath);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      // El archivo ya se guardó automáticamente por diskStorage
      // Solo necesitamos actualizar la ruta en la base de datos
      // Asegurarnos de que la ruta sea relativa a la carpeta uploads
      business.logoPath = file.path.replace(/^uploads\//, '');
      business.updatedAt = new Date();
      await this.businessRepository.save(business);

      return this.getBusinessProfile(businessId);
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  async changeBusinessPassword(
    businessId: number,
    changePasswordDto: IChangePasswordDto,
  ): Promise<void> {
    try {
      const { currentPassword, newPassword, confirmPassword } =
        changePasswordDto;

      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      const business = await this.businessRepository.findOne({
        where: { id: businessId },
      });

      if (!business) {
        throw new NotFoundException('Negocio no encontrado');
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        business.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Contraseña actual incorrecta');
      }

      // Hashear nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      business.password = hashedNewPassword;
      business.updatedAt = new Date();
      await this.businessRepository.save(business);
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  async generateBusinessQR(businessId: number): Promise<IBusinessQRData> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // URL para que los clientes se registren en el negocio
    const qrUrl = `${process.env.FRONTEND_URL}/cliente/registro?businessId=${businessId}`;

    // Generar QR en base64
    const qrCodeBase64 = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return {
      businessId: business.id,
      businessName: business.businessName,
      qrCode: qrCodeBase64,
      qrUrl,
    };
  }

  async getBusinessSettings(businessId: number): Promise<IBusinessSettings> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Por ahora devolvemos configuraciones por defecto
    // En el futuro se puede crear una tabla separada para configuraciones
    return {
      notifications: {
        newClients: true,
        rewards: true,
        lowStock: false,
      },
      business: {
        autoExpireStamps: false,
        stampExpirationDays: 30,
        requireEmailVerification: true,
      },
      marketing: {
        allowPromotions: true,
        shareStatistics: false,
      },
    };
  }

  async updateBusinessSettings(
    businessId: number,
    settings: IBusinessSettings,
  ): Promise<IBusinessSettings> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Por ahora solo devolvemos las configuraciones enviadas
    // En el futuro se puede implementar persistencia en base de datos
    return settings;
  }
}
