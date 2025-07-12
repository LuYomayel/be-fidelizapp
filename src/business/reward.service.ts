import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './entities/reward.entity';
import {
  RewardRedemption,
  RedemptionStatus,
} from './entities/reward-redemption.entity';
import { ClientCard } from '../clients/entities/client-card.entity';
import { Business } from './entities/business.entity';
import {
  IRedemptionTicket,
  IRedemptionDashboard,
  IDeliverRedemptionDto,
  IRedemptionFilters,
  IRewardRedemptionWithClientCard,
  RewardType,
} from '@shared';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    @InjectRepository(RewardRedemption)
    private rewardRedemptionRepository: Repository<RewardRedemption>,
    @InjectRepository(ClientCard)
    private clientCardRepository: Repository<ClientCard>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  // Generar código único de 8 caracteres
  private generateRedemptionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Función helper para transformar RewardRedemption a IRewardRedemptionWithClientCard
  private async transformRedemptionWithClientCard(
    redemption: RewardRedemption,
  ): Promise<IRewardRedemptionWithClientCard> {
    // Obtener información de recompensas para la tarjeta del cliente
    const activeRewards = await this.rewardRepository.find({
      where: {
        businessId: redemption.clientCard.businessId,
        active: true,
      },
      order: { stampsCost: 'ASC' },
    });

    // Filtrar recompensas válidas
    const now = new Date();
    const validRewards = activeRewards.filter((reward) => {
      // Verificar que no esté expirada (solo si tiene fecha de expiración)
      if (reward.expirationDate && reward.expirationDate < now) {
        return false;
      }
      // Verificar que tenga stock (solo si tiene stock definido y no es ilimitado)
      if (
        reward.stock !== undefined &&
        reward.stock !== -1 &&
        reward.stock <= 0
      ) {
        return false;
      }
      return true;
    });

    // Encontrar la recompensa más cercana
    const nearestReward = validRewards.length > 0 ? validRewards[0] : null;
    const progressTarget = nearestReward ? nearestReward.stampsCost : 10;

    return {
      ...redemption,
      clientCard: {
        ...redemption.clientCard,
        nearestReward: nearestReward
          ? {
              id: nearestReward.id,
              name: nearestReward.name,
              stampsCost: nearestReward.stampsCost,
              description: nearestReward.description,
            }
          : undefined,
        progressTarget,
      },
    };
  }

  // Crear una nueva recompensa
  async createReward(
    businessId: number,
    rewardData: {
      name: string;
      description: string;
      requiredStamps: number;
      stampsCost: number;
      image?: string;
      expirationDate?: Date;
      stock?: number;
      specialConditions?: string;
      type?: RewardType;
      typeDescription?: string;
    },
  ): Promise<Reward> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const reward = this.rewardRepository.create({
      ...rewardData,
      businessId,
    });

    return this.rewardRepository.save(reward);
  }

  // Obtener recompensas de un negocio
  async getBusinessRewards(businessId: number): Promise<Reward[]> {
    return this.rewardRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener recompensas disponibles para un cliente
  async getClientAvailableRewards(clientId: number): Promise<Reward[]> {
    try {
      const clientCard = await this.clientCardRepository.findOne({
        where: { clientId },
        relations: ['business'],
      });
      if (!clientCard) {
        throw new NotFoundException('Cliente no tiene tarjeta en este negocio');
      }
      return await this.rewardRepository.find({
        where: { businessId: clientCard.businessId, active: true },
        order: { createdAt: 'DESC' },
      });
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  // Actualizar una recompensa
  async updateReward(
    businessId: number,
    rewardId: number,
    updateData: {
      name?: string;
      description?: string;
      requiredStamps?: number;
      stampsCost?: number;
      image?: string;
      expirationDate?: Date;
      stock?: number;
      specialConditions?: string;
      active?: boolean;
      type?: RewardType;
      typeDescription?: string;
    },
  ): Promise<Reward | null> {
    try {
      const reward = await this.rewardRepository.findOne({
        where: { id: rewardId, businessId },
      });

      if (!reward) {
        throw new NotFoundException('Recompensa no encontrada');
      }
      console.log('updateData', updateData);
      const updatedReward = await this.rewardRepository.update(
        rewardId,
        updateData,
      );
      if (updatedReward.affected === 0) {
        throw new BadRequestException('No se pudo actualizar la recompensa');
      }
      return this.rewardRepository.findOne({
        where: { id: rewardId, businessId },
      });
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  // Eliminar una recompensa
  async deleteReward(
    businessId: number,
    rewardId: number,
  ): Promise<Reward | null> {
    try {
      const reward = await this.rewardRepository.findOne({
        where: { id: rewardId, businessId },
      });

      if (!reward) {
        throw new NotFoundException('Recompensa no encontrada');
      }

      // Soft delete - marcar como inactiva en lugar de eliminar
      reward.active = false;
      await this.rewardRepository.save(reward);
      return reward;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  // Canjear una recompensa (MEJORADO)
  async redeemReward(
    businessId: number,
    rewardId: number,
    clientId: number,
  ): Promise<IRedemptionTicket> {
    // Verificar que la recompensa existe y está activa
    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId, businessId, active: true },
      relations: ['business'],
    });
    if (!reward) {
      throw new NotFoundException('Recompensa no encontrada');
    }

    // Verificar stock
    if (reward && reward.stock && reward.stock <= 0) {
      throw new BadRequestException('Recompensa sin stock disponible');
    }

    // Verificar fecha de expiración
    if (reward.expirationDate && reward.expirationDate < new Date()) {
      throw new BadRequestException('Recompensa expirada');
    }

    // Obtener la tarjeta del cliente
    const clientCard = await this.clientCardRepository.findOne({
      where: { businessId, clientId },
      relations: ['client'],
    });
    if (!clientCard) {
      throw new NotFoundException('Cliente no tiene tarjeta en este negocio');
    }

    // Verificar que tiene suficientes sellos
    if (clientCard.availableStamps < reward.stampsCost) {
      throw new BadRequestException(
        `Necesitas ${reward.stampsCost} sellos para canjear esta recompensa. Tienes ${clientCard.availableStamps}`,
      );
    }

    // Generar código único
    let redemptionCode = '';
    let codeExists = true;

    while (codeExists) {
      redemptionCode = this.generateRedemptionCode();
      const existingRedemption = await this.rewardRedemptionRepository.findOne({
        where: { redemptionCode },
      });
      codeExists = !!existingRedemption;
    }

    // Calcular fecha de expiración (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Registrar el canje
    const redemption = this.rewardRedemptionRepository.create({
      rewardId,
      clientId,
      clientCardId: clientCard.id,
      businessId,
      stampsSpent: reward.stampsCost,
      stampsBefore: clientCard.availableStamps,
      stampsAfter: clientCard.availableStamps - reward.stampsCost,
      redemptionCode,
      status: RedemptionStatus.PENDING,
      expiresAt,
    });

    // Actualizar sellos del cliente
    clientCard.availableStamps -= reward.stampsCost;
    clientCard.usedStamps += reward.stampsCost;
    await this.clientCardRepository.save(clientCard);

    // Actualizar stock de la recompensa
    if (reward && reward.stock) {
      reward.stock -= 1;
      await this.rewardRepository.save(reward);
    }

    const savedRedemption =
      await this.rewardRedemptionRepository.save(redemption);

    // Retornar ticket de reclamo
    return {
      id: savedRedemption.id,
      redemptionCode,
      clientName: `${clientCard.client.firstName} ${clientCard.client.lastName}`,
      clientEmail: clientCard.client.email,
      rewardName: reward.name,
      rewardDescription: reward.description,
      stampsSpent: reward.stampsCost,
      redeemedAt: savedRedemption.redeemedAt,
      expiresAt: savedRedemption.expiresAt,
      status: savedRedemption.status,
      businessName: reward.business.businessName,
      businessLogo: reward.business.logoPath,
    };
  }

  // Obtener dashboard de reclamos para el negocio
  async getRedemptionDashboard(
    businessId: number,
  ): Promise<IRedemptionDashboard> {
    // Contar por estado
    const totalPending = await this.rewardRedemptionRepository.count({
      where: { businessId, status: RedemptionStatus.PENDING },
    });

    const totalDelivered = await this.rewardRedemptionRepository.count({
      where: { businessId, status: RedemptionStatus.DELIVERED },
    });

    const totalExpired = await this.rewardRedemptionRepository.count({
      where: { businessId, status: RedemptionStatus.EXPIRED },
    });

    // Obtener reclamos pendientes
    const pendingRedemptions = await this.rewardRedemptionRepository.find({
      where: { businessId, status: RedemptionStatus.PENDING },
      relations: ['reward', 'client', 'clientCard'],
      order: { redeemedAt: 'DESC' },
      take: 20,
    });

    // Obtener entregas recientes
    const recentDeliveries = await this.rewardRedemptionRepository.find({
      where: { businessId, status: RedemptionStatus.DELIVERED },
      relations: ['reward', 'client', 'clientCard'],
      order: { deliveredAt: 'DESC' },
      take: 10,
    });

    // Transformar las entidades a las interfaces extendidas
    const pendingRedemptionsWithClientCard = await Promise.all(
      pendingRedemptions.map((redemption) =>
        this.transformRedemptionWithClientCard(redemption),
      ),
    );

    const recentDeliveriesWithClientCard = await Promise.all(
      recentDeliveries.map((redemption) =>
        this.transformRedemptionWithClientCard(redemption),
      ),
    );

    return {
      totalPending,
      totalDelivered,
      totalExpired,
      pendingRedemptions: pendingRedemptionsWithClientCard,
      recentDeliveries: recentDeliveriesWithClientCard,
    };
  }

  // Entregar recompensa física
  async deliverRedemption(
    businessId: number,
    deliveryData: IDeliverRedemptionDto,
  ): Promise<RewardRedemption> {
    const redemption = await this.rewardRedemptionRepository.findOne({
      where: {
        id: deliveryData.redemptionId,
        businessId,
        status: RedemptionStatus.PENDING,
      },
      relations: ['reward', 'client'],
    });

    if (!redemption) {
      throw new NotFoundException('Reclamo no encontrado o ya fue procesado');
    }

    // Verificar que no esté expirado
    if (redemption.expiresAt && redemption.expiresAt < new Date()) {
      redemption.status = RedemptionStatus.EXPIRED;
      await this.rewardRedemptionRepository.save(redemption);
      throw new BadRequestException('El código de reclamo ha expirado');
    }

    // Marcar como entregado
    redemption.status = RedemptionStatus.DELIVERED;
    redemption.deliveredAt = new Date();
    redemption.deliveredBy = deliveryData.deliveredBy;
    if (deliveryData.notes) {
      redemption.notes = deliveryData.notes;
    }

    return this.rewardRedemptionRepository.save(redemption);
  }

  // Buscar reclamo por código
  async findRedemptionByCode(
    businessId: number,
    redemptionCode: string,
  ): Promise<RewardRedemption> {
    const redemption = await this.rewardRedemptionRepository.findOne({
      where: { businessId, redemptionCode },
      relations: ['reward', 'client', 'clientCard'],
    });

    if (!redemption) {
      throw new NotFoundException('Código de reclamo no encontrado');
    }

    return redemption;
  }

  // Obtener historial de canjes de recompensas con filtros
  async getRewardRedemptions(
    businessId: number,
    filters: IRedemptionFilters = {},
  ): Promise<{
    redemptions: RewardRedemption[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      clientId,
      rewardId,
    } = filters;

    const queryBuilder = this.rewardRedemptionRepository
      .createQueryBuilder('redemption')
      .leftJoinAndSelect('redemption.reward', 'reward')
      .leftJoinAndSelect('redemption.client', 'client')
      .leftJoinAndSelect('redemption.clientCard', 'clientCard')
      .where('redemption.businessId = :businessId', { businessId });

    if (status) {
      queryBuilder.andWhere('redemption.status = :status', { status });
    }

    if (dateFrom) {
      queryBuilder.andWhere('redemption.redeemedAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('redemption.redeemedAt <= :dateTo', { dateTo });
    }

    if (clientId) {
      queryBuilder.andWhere('redemption.clientId = :clientId', { clientId });
    }

    if (rewardId) {
      queryBuilder.andWhere('redemption.rewardId = :rewardId', { rewardId });
    }

    const [redemptions, total] = await queryBuilder
      .orderBy('redemption.redeemedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      redemptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Obtener historial de reclamos de un cliente específico
  async getClientRedemptionHistory(
    clientId: number,
    filters: IRedemptionFilters = {},
  ): Promise<{
    redemptions: RewardRedemption[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      rewardId,
    } = filters;

    console.log('filters', filters);

    const queryBuilder = this.rewardRedemptionRepository
      .createQueryBuilder('redemption')
      .leftJoinAndSelect('redemption.reward', 'reward')
      .leftJoinAndSelect('redemption.client', 'client')
      .leftJoinAndSelect('redemption.clientCard', 'clientCard')
      .leftJoinAndSelect('reward.business', 'business')
      .where('redemption.clientId = :clientId', { clientId });

    if (status) {
      queryBuilder.andWhere('redemption.status = :status', { status });
    }

    if (dateFrom) {
      queryBuilder.andWhere('redemption.redeemedAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('redemption.redeemedAt <= :dateTo', { dateTo });
    }

    if (rewardId) {
      queryBuilder.andWhere('redemption.rewardId = :rewardId', { rewardId });
    }

    const [redemptions, total] = await queryBuilder
      .orderBy('redemption.redeemedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      redemptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Obtener estadísticas de recompensas
  async getRewardStatistics(businessId: number): Promise<{
    totalRewards: number;
    totalRedemptions: number;
    pendingRedemptions: number;
    mostRedeemedReward?: {
      name: string;
      redemptions: number;
    };
  }> {
    const totalRewards = await this.rewardRepository.count({
      where: { businessId, active: true },
    });

    const totalRedemptions = await this.rewardRedemptionRepository.count({
      where: { businessId },
    });

    const pendingRedemptions = await this.rewardRedemptionRepository.count({
      where: { businessId, status: RedemptionStatus.PENDING },
    });

    // Obtener la recompensa más canjeada
    const mostRedeemed = await this.rewardRedemptionRepository
      .createQueryBuilder('redemption')
      .leftJoin('redemption.reward', 'reward')
      .select('reward.name', 'name')
      .addSelect('COUNT(redemption.id)', 'redemptions')
      .where('redemption.businessId = :businessId', { businessId })
      .groupBy('reward.id')
      .orderBy('redemptions', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      totalRewards,
      totalRedemptions,
      pendingRedemptions,
      mostRedeemedReward: mostRedeemed
        ? {
            name: mostRedeemed.name as string,
            redemptions: parseInt(mostRedeemed.redemptions as string),
          }
        : undefined,
    };
  }

  // Expirar códigos vencidos (tarea programada)
  async expireOldRedemptions(): Promise<void> {
    const now = new Date();

    await this.rewardRedemptionRepository
      .createQueryBuilder()
      .update(RewardRedemption)
      .set({ status: RedemptionStatus.EXPIRED })
      .where('status = :status', { status: RedemptionStatus.PENDING })
      .andWhere('expiresAt < :now', { now })
      .execute();
  }
}
