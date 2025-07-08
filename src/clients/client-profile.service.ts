import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { Stamp } from '../business/entities/stamp.entity';
import { RewardRedemption } from '../business/entities/reward-redemption.entity';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import {
  IClientProfile,
  IUpdateClientProfileDto,
  IChangePasswordDto,
  IClientSettings,
} from '@shared';

@Injectable()
export class ClientProfileService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Stamp)
    private stampRepository: Repository<Stamp>,
    @InjectRepository(RewardRedemption)
    private rewardRedemptionRepository: Repository<RewardRedemption>,
  ) {}

  async getClientProfile(clientId: number): Promise<IClientProfile> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Obtener estadísticas del cliente
    const totalStamps = await this.stampRepository.count({
      where: { usedBy: clientId },
    });

    const totalRedemptions = await this.rewardRedemptionRepository.count({
      where: { clientId: clientId },
    });

    return {
      id: client.id,
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      profilePicture: client.profilePicture,
      provider: client.provider,
      emailVerified: client.emailVerified,
      isActive: client.isActive,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      totalStamps,
      totalRedemptions,
      memberSince: client.createdAt,
    };
  }

  async updateClientProfile(
    clientId: number,
    updateData: IUpdateClientProfileDto,
  ): Promise<IClientProfile> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Validar email único si se está actualizando
    if (updateData.email && updateData.email !== client.email) {
      const existingClient = await this.clientRepository.findOne({
        where: { email: updateData.email },
      });
      if (existingClient) {
        throw new BadRequestException('El email ya está en uso');
      }
    }

    // Si se está actualizando la contraseña, validar la actual
    if (updateData.password && updateData.currentPassword && client.password) {
      const isCurrentPasswordValid = await bcrypt.compare(
        updateData.currentPassword,
        client.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Contraseña actual incorrecta');
      }

      // Hashear nueva contraseña
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Remover campos que no se deben actualizar directamente
    const { currentPassword, ...dataToUpdate } = updateData;

    // Actualizar campos
    Object.assign(client, dataToUpdate);
    client.updatedAt = new Date();

    await this.clientRepository.save(client);

    return this.getClientProfile(clientId);
  }

  async updateClientProfilePicture(
    clientId: number,
    file: Express.Multer.File,
  ): Promise<IClientProfile> {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo de imagen');
    }

    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'uploads', 'profile-pictures');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Eliminar imagen anterior si existe
    if (client.profilePicture) {
      const oldImagePath = path.join(process.cwd(), client.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Guardar nueva imagen
    const filename = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}.${file.originalname.split('.').pop()}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    // Actualizar ruta en base de datos
    client.profilePicture = `uploads/profile-pictures/${filename}`;
    client.updatedAt = new Date();
    await this.clientRepository.save(client);

    return this.getClientProfile(clientId);
  }

  async changeClientPassword(
    clientId: number,
    changePasswordDto: IChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (!client.password) {
      throw new BadRequestException(
        'Este cliente no tiene contraseña configurada',
      );
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      client.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    client.password = hashedNewPassword;
    client.updatedAt = new Date();
    await this.clientRepository.save(client);
  }

  async getClientSettings(clientId: number): Promise<IClientSettings> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Por ahora devolvemos configuraciones por defecto
    // En el futuro se puede crear una tabla separada para configuraciones
    return {
      notifications: {
        email: true,
        push: true,
        rewards: true,
        stamps: true,
      },
      privacy: {
        profileVisible: true,
        shareActivity: false,
      },
      preferences: {
        language: 'es',
        theme: 'light',
      },
    };
  }

  async updateClientSettings(
    clientId: number,
    settings: IClientSettings,
  ): Promise<IClientSettings> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Por ahora solo devolvemos las configuraciones enviadas
    // En el futuro se puede implementar persistencia en base de datos
    return settings;
  }

  async getClientStatistics(clientId: number): Promise<any> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Obtener estadísticas detalladas
    const totalStamps = await this.stampRepository.count({
      where: { usedBy: clientId },
    });

    const totalRedemptions = await this.rewardRedemptionRepository.count({
      where: { clientId: clientId },
    });

    // Obtener sellos por negocio
    const stampsByBusiness = await this.stampRepository
      .createQueryBuilder('stamp')
      .innerJoin('stamp.business', 'business')
      .select('business.businessName', 'businessName')
      .addSelect('COUNT(stamp.id)', 'count')
      .where('stamp.usedBy = :clientId', { clientId })
      .groupBy('business.id')
      .getRawMany();

    // Obtener recompensas canjeadas por negocio
    const rewardsByBusiness = await this.rewardRedemptionRepository
      .createQueryBuilder('reward')
      .innerJoin('reward.business', 'business')
      .select('business.businessName', 'businessName')
      .addSelect('COUNT(reward.id)', 'count')
      .where('reward.clientId = :clientId', { clientId })
      .groupBy('business.id')
      .getRawMany();

    return {
      totalStamps,
      totalRedemptions,
      stampsByBusiness,
      rewardsByBusiness,
      memberSince: client.createdAt,
      accountAge: Math.floor(
        (Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      ),
    };
  }
}
