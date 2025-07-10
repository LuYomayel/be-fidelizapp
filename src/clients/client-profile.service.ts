import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { ClientCard } from './entities/client-card.entity';
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
    @InjectRepository(ClientCard)
    private clientCardRepository: Repository<ClientCard>,
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

    // Obtener estadísticas básicas
    const totalStamps = await this.stampRepository.count({
      where: { usedBy: clientId },
    });

    const totalRedemptions = await this.rewardRedemptionRepository.count({
      where: { clientId: clientId },
    });

    // Obtener tarjetas de cliente con información de negocios
    const clientCards = await this.clientCardRepository.find({
      where: { clientId },
      relations: ['business'],
      order: { lastStampDate: 'DESC' },
    });

    // Obtener estadísticas detalladas por negocio usando las tarjetas de cliente
    const stampsByBusiness = clientCards.map((card) => ({
      businessName: card.business.businessName,
      businessId: card.businessId,
      totalStamps: card.totalStamps,
      availableStamps: card.availableStamps,
      usedStamps: card.usedStamps,
      level: card.level,
      lastStampDate: card.lastStampDate,
    }));

    // Obtener recompensas recientes (últimas 5)
    const recentRewards = await this.rewardRedemptionRepository.find({
      where: { clientId },
      relations: ['reward', 'reward.business'],
      order: { redeemedAt: 'DESC' },
      take: 5,
    });

    // Calcular días activos
    const accountAge = Math.floor(
      (Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Mapear tarjetas de cliente
    const mappedClientCards = clientCards.map((card) => ({
      id: card.id,
      businessId: card.businessId,
      businessName: card.business.businessName,
      businessLogo: card.business.logoPath,
      businessType: card.business.type,
      totalStamps: card.totalStamps,
      availableStamps: card.availableStamps,
      usedStamps: card.usedStamps,
      level: card.level,
      lastStampDate: card.lastStampDate,
      stampsForReward: card.business.stampsForReward,
      rewardDescription: card.business.rewardDescription,
    }));

    // Mapear recompensas recientes
    const mappedRecentRewards = recentRewards.map((reward) => ({
      id: reward.id,
      rewardName: reward.reward.name,
      businessName: reward.reward.business.businessName,
      businessLogo: reward.reward.business.logoPath,
      stampsSpent: reward.stampsSpent,
      redemptionCode: reward.redemptionCode,
      status: reward.status,
      redeemedAt: reward.redeemedAt,
      expiresAt: reward.expiresAt,
    }));

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
      statistics: {
        totalStamps,
        totalRedemptions,
        activeDays: accountAge,
        totalBusinesses: clientCards.length,
        stampsByBusiness,
        rewardsByBusiness: [], // Por ahora vacío, se puede implementar después
      },
      clientCards: mappedClientCards,
      recentRewards: mappedRecentRewards,
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

    void currentPassword; // Evitar error de linter

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
    try {
      const { currentPassword, newPassword, confirmPassword } =
        changePasswordDto;

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

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        client.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Contraseña actual incorrecta');
      }

      // Hashear nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword.trim(), 10);

      // Actualizar contraseña
      client.password = hashedNewPassword;
      client.updatedAt = new Date();
      await this.clientRepository.save(client);
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  async resetPasswordWithoutCurrent(
    clientId: number,
    newPassword: string,
  ): Promise<void> {
    try {
      const client = await this.clientRepository.findOne({
        where: { id: clientId },
      });

      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }

      // Hashear nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword.trim(), 10);

      // Actualizar contraseña
      client.password = hashedNewPassword;
      client.updatedAt = new Date();
      await this.clientRepository.save(client);
    } catch (error) {
      console.log('error', error);
      throw error;
    }
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
