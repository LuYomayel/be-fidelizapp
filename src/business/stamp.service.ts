import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StampStatus, StampType } from '@shared';
import { Stamp } from './entities/stamp.entity';
import { Business } from './entities/business.entity';
import { ClientCard } from '../clients/entities/client-card.entity';
import { Client } from '../clients/entities/client.entity';
import { StampRedemption } from '../clients/entities/stamp-redemption.entity';
import { CreateStampDto, RedeemStampDto } from '../common/dto';
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
    } catch (error) {
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

  /**
   * Obtiene todos los sellos generados por un negocio
   */
  async getStampsByBusiness(
    businessId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    stamps: Stamp[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [stamps, total] = await this.stampRepository.findAndCount({
      where: { businessId },
      relations: ['business'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      stamps,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene las tarjetas de un cliente
   */
  async getClientCards(clientId: number): Promise<ClientCard[]> {
    return await this.clientCardRepository.find({
      where: { clientId },
      relations: ['business'],
      order: { lastStampDate: 'DESC' },
    });
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
  async getRedemptionHistory(
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
}
