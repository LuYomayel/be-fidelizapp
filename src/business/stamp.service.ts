import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  Like,
  Between,
} from 'typeorm';
import { IRedemptionFilters, StampStatus, StampType } from '@shared';
import { Stamp } from './entities/stamp.entity';
import { Business } from './entities/business.entity';
import { ClientCard } from '../clients/entities/client-card.entity';
import { Client } from '../clients/entities/client.entity';
import { StampRedemption } from '../clients/entities/stamp-redemption.entity';
import { Reward } from './entities/reward.entity';
import { CreateStampDto } from '../common/dto';
import * as QRCode from 'qrcode';

@Injectable()
export class StampService {
  constructor(
    @InjectRepository(Stamp)
    private stampRepository: Repository<Stamp>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(ClientCard)
    private clientCardRepository: Repository<ClientCard>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(StampRedemption)
    private redemptionRepository: Repository<StampRedemption>,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
  ) {}

  /**
   * Genera un código único de 6 dígitos
   */
  private generateStampCode(): string {
    // Generar número aleatorio de 6 dígitos (100000 - 999999)
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Genera un código QR en base64
   */
  private async generateQRCode(code: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(code, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch {
      throw new BadRequestException('Error generando código QR');
    }
  }

  /**
   * Crea un nuevo sello con expiración automática de 5 minutos
   */
  async createQuickStamp(
    businessId: number,
    saleValue: number,
    description?: string,
  ): Promise<Stamp> {
    // Verificar que el negocio existe
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Generar código único
    let code: string = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = this.generateStampCode();
      const existingStamp = await this.stampRepository.findOne({
        where: { code },
      });

      if (!existingStamp) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException('Error generando código único');
    }

    // Generar QR Code
    const qrCode = await this.generateQRCode(code);

    // Calcular expiración (5 minutos desde ahora)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Determinar valor de sellos basado en el valor de venta
    let stampValue = 1; // Por defecto 1 sello
    if (saleValue >= 100) stampValue = 2; // Ventas grandes dan 2 sellos
    if (saleValue >= 200) stampValue = 3; // Ventas muy grandes dan 3 sellos

    // Crear el sello
    const stamp = this.stampRepository.create({
      businessId,
      code,
      qrCode,
      stampType: StampType.PURCHASE, // Siempre será compra en modo rápido
      stampValue,
      description: description || `Venta por $${saleValue}`,
      expiresAt,
      status: StampStatus.ACTIVE,
    });

    return await this.stampRepository.save(stamp);
  }

  /**
   * Crea un nuevo sello para un negocio (método completo)
   */
  async createStamp(
    businessId: number,
    createStampDto: CreateStampDto,
  ): Promise<Stamp> {
    // Verificar que el negocio existe
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Generar código único
    let code: string = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = this.generateStampCode();
      const existingStamp = await this.stampRepository.findOne({
        where: { code },
      });

      if (!existingStamp) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException('Error generando código único');
    }

    // Generar QR Code
    const qrCode = await this.generateQRCode(code);

    // Si no hay fecha de expiración, poner 5 minutos por defecto
    const expiresAt =
      createStampDto.expiresAt ||
      (() => {
        const exp = new Date();
        exp.setMinutes(exp.getMinutes() + 5);
        return exp;
      })();

    // Crear el sello
    const stamp = this.stampRepository.create({
      businessId,
      code,
      qrCode,
      stampType: createStampDto.stampType,
      purchaseType: createStampDto.purchaseType,
      stampValue: createStampDto.stampValue,
      description: createStampDto.description,
      expiresAt,
      status: StampStatus.ACTIVE,
    });

    return await this.stampRepository.save(stamp);
  }

  /**
   * Canjea un sello por un cliente
   */
  async redeemStamp(
    clientId: number,
    code: string,
  ): Promise<{
    stamp: Stamp;
    clientCard: ClientCard;
    stampsEarned: number;
    redemption: {
      id: number;
      redeemedAt: Date;
      stampId: number;
      clientId: number;
      clientCardId: number;
    };
  }> {
    // Buscar el sello
    const stamp = await this.stampRepository.findOne({
      where: { code },
      relations: ['business'],
    });

    if (!stamp) {
      throw new NotFoundException('Código de sello no encontrado');
    }

    // Verificar que el sello esté activo
    if (stamp.status !== StampStatus.ACTIVE) {
      throw new BadRequestException('El código ya fue usado o está expirado');
    }

    // Verificar si el sello no ha expirado
    if (stamp.expiresAt && new Date() > stamp.expiresAt) {
      // Marcar como expirado
      stamp.status = StampStatus.EXPIRED;
      await this.stampRepository.save(stamp);
      throw new BadRequestException('El código ha expirado');
    }

    // Verificar que el cliente existe
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Buscar o crear la tarjeta del cliente para este negocio
    let clientCard = await this.clientCardRepository.findOne({
      where: { clientId, businessId: stamp.businessId },
      relations: ['business'],
    });

    if (!clientCard) {
      clientCard = this.clientCardRepository.create({
        clientId,
        businessId: stamp.businessId,
        totalStamps: 0,
        availableStamps: 0,
        usedStamps: 0,
        level: 1,
      });
    }

    // Verificar que el cliente no haya canjeado ya este sello
    const existingRedemption = await this.redemptionRepository.findOne({
      where: { stampId: stamp.id, clientId },
    });

    if (existingRedemption) {
      throw new BadRequestException('Ya has canjeado este código');
    }

    // Actualizar la tarjeta del cliente
    const stampsEarned = stamp.stampValue;
    clientCard.totalStamps += stampsEarned;
    clientCard.availableStamps += stampsEarned;
    clientCard.lastStampDate = new Date();

    // Calcular nivel basado en total de sellos
    // Cada 10 sellos = 1 nivel
    clientCard.level = Math.floor(clientCard.totalStamps / 10) + 1;

    // Guardar la tarjeta actualizada
    await this.clientCardRepository.save(clientCard);

    // Marcar el sello como usado
    stamp.status = StampStatus.USED;
    stamp.usedAt = new Date();
    stamp.usedBy = clientId;
    await this.stampRepository.save(stamp);

    // Crear el registro de canje
    const redemption = this.redemptionRepository.create({
      stampId: stamp.id,
      clientId,
      clientCardId: clientCard.id,
      redeemedAt: new Date(),
    });
    await this.redemptionRepository.save(redemption);

    // Recargar la tarjeta con las relaciones
    const updatedClientCard = await this.clientCardRepository.findOne({
      where: { id: clientCard.id },
      relations: ['business'],
    });

    return {
      stamp,
      clientCard: updatedClientCard!,
      stampsEarned,
      redemption: {
        id: redemption.id,
        redeemedAt: redemption.redeemedAt,
        stampId: redemption.stampId,
        clientId: redemption.clientId,
        clientCardId: redemption.clientCardId,
      },
    };
  }

  private isStampExpired(stamp: Stamp): boolean {
    if (!stamp.expiresAt) return false;
    // Solamente actualizamos si el estado es activo. Sino es activo entonces es usado o cancelado y no me interesa.
    if (stamp.status !== StampStatus.ACTIVE) return false;
    return new Date(stamp.expiresAt) < new Date();
  }

  /**
   * Obtiene todos los sellos generados por un negocio
   */
  async getStampsByBusinessWithFilters(
    businessId: number,
    filters: {
      page: number;
      limit: number;
      search?: string;
      status?: StampStatus;
      stampType?: StampType;
      purchaseType?: string;
      dateFrom?: Date;
      dateTo?: Date;
      clientId?: number;
    },
  ): Promise<{
    stamps: Stamp[];
    clients: Client[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Construir las condiciones de búsqueda con tipado correcto
    const whereConditions: Record<string, any> = { businessId };

    // Filtro por búsqueda (código)
    if (filters.search) {
      whereConditions.code = Like(`%${filters.search}%`);
    }

    // Filtro por estado
    if (filters.status) {
      whereConditions.status = filters.status;
    }

    // Filtro por tipo de sello
    if (filters.stampType) {
      whereConditions.stampType = filters.stampType;
    }

    // Filtro por tipo de compra
    if (filters.purchaseType) {
      whereConditions.purchaseType = filters.purchaseType;
    }

    // Filtro por cliente
    if (filters.clientId) {
      whereConditions.usedBy = filters.clientId;
    }

    // Filtro por fechas - corregido
    if (filters.dateFrom || filters.dateTo) {
      if (filters.dateFrom && filters.dateTo) {
        whereConditions.createdAt = Between(filters.dateFrom, filters.dateTo);
      } else if (filters.dateFrom) {
        whereConditions.createdAt = MoreThanOrEqual(filters.dateFrom);
      } else if (filters.dateTo) {
        whereConditions.createdAt = LessThanOrEqual(filters.dateTo);
      }
    }

    const [stamps, total] = await this.stampRepository.findAndCount({
      where: whereConditions,
      relations: ['business'],
      order: { createdAt: 'DESC' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    const updatedStamps = stamps.map((stamp) => {
      return {
        ...stamp,
        status: this.isStampExpired(stamp) ? StampStatus.EXPIRED : stamp.status,
      };
    });

    // Obtener clientes únicos que han usado sellos
    const clientIds = [
      ...new Set(stamps.map((stamp) => stamp.usedBy).filter(Boolean)),
    ];

    let clients: Client[] = [];
    if (clientIds.length > 0) {
      clients = await this.clientRepository.find({
        where: { id: In(clientIds) },
      });
    }

    // Mapear sellos con información del cliente
    const stampsWithClient = updatedStamps.map((stamp) => {
      const client = clients.find((c) => c.id === stamp.usedBy);
      return {
        ...stamp,
        client,
      };
    });

    return {
      stamps: stampsWithClient,
      clients,
      total,
      page: filters.page,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  /**
   * Obtiene todas las client cards de un negocio
   */
  async getClientCardsByBusiness(businessId: number): Promise<ClientCard[]> {
    return await this.clientCardRepository.find({
      where: { businessId },
      relations: ['client', 'business'],
    });
  }

  /**
   * Obtiene las tarjetas de un cliente con información de recompensas
   */
  async getClientCards(clientId: number): Promise<
    Array<
      ClientCard & {
        nearestReward?: {
          id: number;
          name: string;
          stampsCost: number;
          description: string;
        };
        progressTarget: number;
      }
    >
  > {
    // Obtener todas las tarjetas del cliente
    const clientCards = await this.clientCardRepository.find({
      where: { clientId },
      relations: ['business'],
      order: { lastStampDate: 'DESC' },
    });

    // Procesar cada tarjeta para agregar información de recompensas
    const clientCardsWithRewards = await Promise.all(
      clientCards.map(async (clientCard) => {
        // Obtener recompensas activas del negocio
        const activeRewards = await this.rewardRepository.find({
          where: {
            businessId: clientCard.businessId,
            active: true,
          },
          order: { stampsCost: 'ASC' }, // Ordenar por menor cantidad de sellos requeridos
        });

        // Filtrar recompensas válidas (activas, no expiradas, con stock)
        const now = new Date();
        const validRewards = activeRewards.filter((reward) => {
          // Verificar que no esté expirada (solo si tiene fecha de expiración)
          if (reward.expirationDate && reward.expirationDate < now) {
            console.log('reward expirada', reward.expirationDate);
            return false;
          }
          // Verificar que tenga stock (solo si tiene stock definido y no es ilimitado)
          if (
            reward.stock !== undefined &&
            reward.stock !== null &&
            reward.stock !== -1 &&
            reward.stock <= 0
          ) {
            console.log('reward en stock', reward.stock);
            return false;
          }
          return true;
        });

        // Encontrar la recompensa más cercana (que requiera menos sellos)
        const nearestReward = validRewards.length > 0 ? validRewards[0] : null;

        // Determinar el objetivo de progreso
        let progressTarget = 10; // Por defecto 10 sellos
        if (nearestReward) {
          progressTarget = nearestReward.stampsCost;
        }

        return {
          ...clientCard,
          nearestReward: nearestReward
            ? {
                id: nearestReward.id,
                name: nearestReward.name,
                stampsCost: nearestReward.stampsCost,
                description: nearestReward.description,
              }
            : undefined,
          progressTarget,
        };
      }),
    );

    return clientCardsWithRewards;
  }

  /**
   * Obtiene las tarjetas de un cliente con recompensas disponibles
   */
  async getClientCardsWithAvailableRewards(clientId: number): Promise<
    Array<
      ClientCard & {
        nearestReward?: {
          id: number;
          name: string;
          stampsCost: number;
          description: string;
        };
        progressTarget: number;
        availableRewards: Reward[];
      }
    >
  > {
    // Obtener todas las tarjetas del cliente
    const clientCards = await this.clientCardRepository.find({
      where: { clientId },
      relations: ['business'],
      order: { lastStampDate: 'DESC' },
    });

    // Procesar cada tarjeta para agregar información de recompensas
    const clientCardsWithRewards = await Promise.all(
      clientCards.map(async (clientCard) => {
        // Obtener recompensas activas del negocio
        const activeRewards = await this.rewardRepository.find({
          where: {
            businessId: clientCard.businessId,
            active: true,
          },
          order: { stampsCost: 'DESC' }, // Ordenar por mayor cantidad de sellos requeridos
        });

        // Filtrar recompensas válidas (activas, no expiradas, con stock)
        const now = new Date();
        const validRewards = activeRewards.filter((reward) => {
          // Verificar que no esté expirada (solo si tiene fecha de expiración)
          if (reward.expirationDate && reward.expirationDate < now) {
            console.log('reward expirada', reward.expirationDate);
            return false;
          }
          // Verificar que tenga stock (solo si tiene stock definido y no es ilimitado)
          if (
            reward.stock !== undefined &&
            reward.stock !== null &&
            reward.stock !== -1 &&
            reward.stock <= 0
          ) {
            console.log('reward en stock', reward.stock);
            return false;
          }
          return true;
        });
        // Encontrar la recompensa más cercana (que requiera menos sellos)
        const nearestReward = validRewards.length > 0 ? validRewards[0] : null;

        // Determinar el objetivo de progreso
        let progressTarget = 10; // Por defecto 10 sellos
        if (nearestReward) {
          progressTarget = nearestReward.stampsCost;
        }

        return {
          ...clientCard,
          nearestReward: nearestReward
            ? {
                id: nearestReward.id,
                name: nearestReward.name,
                stampsCost: nearestReward.stampsCost,
                description: nearestReward.description,
              }
            : undefined,
          progressTarget,
          availableRewards: validRewards,
        };
      }),
    );

    return clientCardsWithRewards;
  }

  /**
   * Obtiene una tarjeta específica de un cliente para un negocio
   */
  async getClientCard(
    clientId: number,
    businessId: number,
  ): Promise<ClientCard> {
    const clientCard = await this.clientCardRepository.findOne({
      where: { clientId, businessId },
      relations: ['business', 'client'],
    });

    if (!clientCard) {
      throw new NotFoundException('Tarjeta no encontrada');
    }

    return clientCard;
  }

  /**
   * Obtiene una tarjeta específica del cliente para un negocio (alias)
   */
  async getClientCardByBusiness(
    clientId: number,
    businessId: number,
  ): Promise<ClientCard> {
    return this.getClientCard(clientId, businessId);
  }

  /**
   * Obtiene el historial de canjes de un cliente para un negocio
   */
  async getRedemptionHistoryByBusiness(
    clientId: number,
    businessId: number,
  ): Promise<any[]> {
    const redemptions = await this.redemptionRepository.find({
      where: { clientId },
      relations: ['stamp', 'stamp.business'],
      order: { redeemedAt: 'DESC' },
    });

    // Filtrar solo los canjes del negocio específico
    const businessRedemptions = redemptions.filter(
      (redemption) => redemption.stamp.businessId === businessId,
    );

    return businessRedemptions.map((redemption) => ({
      id: redemption.id,
      stampsEarned: redemption.stamp.stampValue,
      redeemedAt: redemption.redeemedAt,
      stamp: {
        id: redemption.stamp.id,
        code: redemption.stamp.code,
        description: redemption.stamp.description,
        stampValue: redemption.stamp.stampValue,
        stampType: redemption.stamp.stampType,
      },
    }));
  }

  /**
   * Obtiene el historial de canjes de un cliente paginado
   */
  async getRedemptionHistory(
    clientId: number,
    filters: IRedemptionFilters,
  ): Promise<{
    redemptions: StampRedemption[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 10;

      // Obtener el total de registros
      const total = await this.redemptionRepository.count({
        where: { clientId },
      });

      // Obtener los registros paginados
      const redemptions = await this.redemptionRepository.find({
        where: { clientId },
        relations: ['stamp', 'stamp.business'],
        order: { redeemedAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        redemptions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener el historial de canjes: ' + error.message,
      );
    }
  }

  /**
   * Obtiene estadísticas de sellos para un negocio
   */
  async getStampStatistics(businessId: number): Promise<{
    totalGenerated: number;
    totalUsed: number;
    totalExpired: number;
    totalActive: number;
    recentStamps: Stamp[];
  }> {
    const [totalGenerated, totalUsed, totalExpired, totalActive] =
      await Promise.all([
        this.stampRepository.count({ where: { businessId } }),
        this.stampRepository.count({
          where: { businessId, status: StampStatus.USED },
        }),
        this.stampRepository.count({
          where: { businessId, status: StampStatus.EXPIRED },
        }),
        this.stampRepository.count({
          where: { businessId, status: StampStatus.ACTIVE },
        }),
      ]);

    const recentStamps = await this.stampRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalGenerated,
      totalUsed,
      totalExpired,
      totalActive,
      recentStamps,
    };
  }

  /**
   * Cancela un sello activo
   */
  async cancelStamp(stampId: number, businessId: number): Promise<Stamp> {
    const stamp = await this.stampRepository.findOne({
      where: { id: stampId, businessId },
    });

    if (!stamp) {
      throw new NotFoundException('Sello no encontrado');
    }

    if (stamp.status !== StampStatus.ACTIVE) {
      throw new BadRequestException('Solo se pueden cancelar sellos activos');
    }

    stamp.status = StampStatus.CANCELLED;
    return await this.stampRepository.save(stamp);
  }

  /**
   * Obtiene un sello por su código
   */
  async getStampByCode(code: string): Promise<Stamp> {
    const stamp = await this.stampRepository.findOne({
      where: { code },
      relations: ['business'],
    });

    if (!stamp) {
      throw new NotFoundException('Código no encontrado');
    }

    return stamp;
  }

  /**
   * Elimina sellos expirados automáticamente
   */
  async cleanupExpiredStamps(): Promise<void> {
    const expiredStamps = await this.stampRepository.find({
      where: {
        status: StampStatus.ACTIVE,
      },
    });

    for (const stamp of expiredStamps) {
      if (stamp.expiresAt && new Date() > stamp.expiresAt) {
        stamp.status = StampStatus.EXPIRED;
        await this.stampRepository.save(stamp);
      }
    }
  }

  /**
   * Obtiene todos los clientes que han interactuado con un negocio
   */
  async getBusinessClients(businessId: number): Promise<{
    clients: Array<{
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
      totalStamps: number;
      availableStamps: number;
      usedStamps: number;
      level: number;
      lastStampDate?: Date;
      totalRedemptions: number;
      createdAt: Date;
    }>;
    total: number;
  }> {
    const clientCards = await this.clientCardRepository.find({
      where: { businessId },
      relations: ['client'],
      order: { lastStampDate: 'DESC' },
    });

    // Obtener conteo de canjes por cliente
    const redemptionsCount = await this.redemptionRepository
      .createQueryBuilder('redemption')
      .select('redemption.clientId', 'clientId')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('redemption.stamp', 'stamp')
      .where('stamp.businessId = :businessId', { businessId })
      .groupBy('redemption.clientId')
      .getRawMany();

    const redemptionsMap = new Map(
      redemptionsCount.map((r) => [r.clientId, parseInt(r.count)]),
    );

    const clients = clientCards.map((card) => ({
      id: card.client.id,
      firstName: card.client.firstName,
      lastName: card.client.lastName,
      email: card.client.email,
      profilePicture: card.client.profilePicture,
      totalStamps: card.totalStamps,
      availableStamps: card.availableStamps,
      usedStamps: card.usedStamps,
      level: card.level,
      lastStampDate: card.lastStampDate,
      totalRedemptions: redemptionsMap.get(card.clientId) || 0,
      createdAt: card.createdAt,
    }));

    return {
      clients,
      total: clients.length,
    };
  }
}
