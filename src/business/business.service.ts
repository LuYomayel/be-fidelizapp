import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Business } from './entities/business.entity';
import { CreateBusinessDto, UpdateBusinessDto } from '../common/dto';
import { BusinessType, IDashboard, IClientCardWithReward } from '@shared';
import { StampService } from './stamp.service';
import { Stamp } from './entities/stamp.entity';
import { Client } from '../clients/entities/client.entity';
import { ClientCard } from '../clients/entities/client-card.entity';
import { StampRedemption } from '../clients/entities/stamp-redemption.entity';
import { Reward } from './entities/reward.entity';
import { RewardRedemption } from './entities/reward-redemption.entity';
//TODO: Importar Reward

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private jwtService: JwtService,
    @InjectRepository(Stamp)
    private stampRepository: Repository<Stamp>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(ClientCard)
    private clientCardRepository: Repository<ClientCard>,
    @InjectRepository(StampRedemption)
    private stampRedemptionRepository: Repository<StampRedemption>,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    @InjectRepository(RewardRedemption)
    private rewardRedemptionRepository: Repository<RewardRedemption>,
    private stampService: StampService,
  ) {}

  async create(
    createBusinessDto: CreateBusinessDto,
    logoPath?: string,
  ): Promise<Business> {
    const existingBusiness = await this.businessRepository.findOne({
      where: { email: createBusinessDto.email },
    });

    if (existingBusiness) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createBusinessDto.password, 10);

    if (createBusinessDto.type !== BusinessType.OTRO) {
      createBusinessDto.customType = undefined;
    }
    const business = this.businessRepository.create({
      ...createBusinessDto,
      password: hashedPassword,
      logoPath: logoPath || undefined,
    });

    return await this.businessRepository.save(business);
  }

  async findAll(): Promise<Business[]> {
    return await this.businessRepository.find();
  }

  async findOne(id: number): Promise<Business> {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException(`Negocio con ID ${id} no encontrado`);
    }
    return business;
  }

  async findByEmail(email: string): Promise<Business | null> {
    return await this.businessRepository.findOne({ where: { email } });
  }

  async getDashboard(businessId: number): Promise<IDashboard> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Fechas para comparación mes actual vs mes anterior
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    // Total de sellos generados (mes actual)
    const totalStamps = await this.stampRepository.count({
      where: { businessId: business.id },
    });

    // Sellos del mes actual
    const stampsCurrentMonth = await this.stampRepository.count({
      where: {
        businessId: business.id,
        createdAt: Between(currentMonthStart, currentMonthEnd),
      },
    });

    // Sellos del mes anterior
    const stampsPreviousMonth = await this.stampRepository.count({
      where: {
        businessId: business.id,
        createdAt: Between(previousMonthStart, previousMonthEnd),
      },
    });

    // Calcular crecimiento de sellos
    const stampsGrowth =
      stampsPreviousMonth > 0
        ? ((stampsCurrentMonth - stampsPreviousMonth) / stampsPreviousMonth) *
          100
        : stampsCurrentMonth > 0
          ? 100
          : 0;

    // Clientes activos (que tienen tarjeta)
    const activeClients = await this.clientCardRepository.count({
      where: { businessId: business.id },
    });

    // Clientes nuevos del mes actual
    const clientsCurrentMonth = await this.clientCardRepository.count({
      where: {
        businessId: business.id,
        createdAt: Between(currentMonthStart, currentMonthEnd),
      },
    });

    // Clientes nuevos del mes anterior
    const clientsPreviousMonth = await this.clientCardRepository.count({
      where: {
        businessId: business.id,
        createdAt: Between(previousMonthStart, previousMonthEnd),
      },
    });

    // Calcular crecimiento de clientes
    const clientsGrowth =
      clientsPreviousMonth > 0
        ? ((clientsCurrentMonth - clientsPreviousMonth) /
            clientsPreviousMonth) *
          100
        : clientsCurrentMonth > 0
          ? 100
          : 0;

    // Recompensas canjeadas (CORRECTO: cuenta canjes de recompensas, no sellos)
    const rewardsExchanged = await this.rewardRedemptionRepository.count({
      where: { businessId: business.id },
    });

    // Recompensas del mes actual
    const rewardsCurrentMonth = await this.rewardRedemptionRepository.count({
      where: {
        businessId: business.id,
        redeemedAt: Between(currentMonthStart, currentMonthEnd),
      },
    });

    // Recompensas del mes anterior
    const rewardsPreviousMonth = await this.rewardRedemptionRepository.count({
      where: {
        businessId: business.id,
        redeemedAt: Between(previousMonthStart, previousMonthEnd),
      },
    });

    // Calcular crecimiento de recompensas
    const rewardsGrowth =
      rewardsPreviousMonth > 0
        ? ((rewardsCurrentMonth - rewardsPreviousMonth) /
            rewardsPreviousMonth) *
          100
        : rewardsCurrentMonth > 0
          ? 100
          : 0;

    // Calcular retención de clientes: (Clientes registrados en el año - Clientes Nuevos / 100) * 100
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const totalClientsThisYear = await this.clientCardRepository.count({
      where: {
        businessId: business.id,
        createdAt: Between(yearStart, yearEnd),
      },
    });

    const newClientsThisYear = await this.clientCardRepository.count({
      where: {
        businessId: business.id,
        createdAt: Between(yearStart, yearEnd),
      },
    });

    const clientRetention =
      totalClientsThisYear > 0
        ? ((totalClientsThisYear - newClientsThisYear) / totalClientsThisYear) *
          100
        : 0;

    // Calcular retención del mes anterior para comparación
    const previousYearStart = new Date(currentYear - 1, 0, 1);
    const previousYearEnd = new Date(currentYear - 1, 11, 31, 23, 59, 59);

    const totalClientsPreviousYear = await this.clientCardRepository.count({
      where: {
        businessId: business.id,
        createdAt: Between(previousYearStart, previousYearEnd),
      },
    });

    const newClientsPreviousYear = await this.clientCardRepository.count({
      where: {
        businessId: business.id,
        createdAt: Between(previousYearStart, previousYearEnd),
      },
    });

    const retentionPreviousYear =
      totalClientsPreviousYear > 0
        ? ((totalClientsPreviousYear - newClientsPreviousYear) /
            totalClientsPreviousYear) *
          100
        : 0;

    // Calcular crecimiento de retención
    const retentionGrowth =
      retentionPreviousYear > 0
        ? ((clientRetention - retentionPreviousYear) / retentionPreviousYear) *
          100
        : clientRetention > 0
          ? 100
          : 0;

    // Clientes recientes con información de recompensas
    const recentClientCards = await this.clientCardRepository.find({
      where: { businessId: business.id },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['client'],
    });

    // Obtener información de recompensas para cada tarjeta
    const recentClients: IClientCardWithReward[] = await Promise.all(
      recentClientCards.map(async (clientCard) => {
        // Obtener recompensas activas del negocio
        const activeRewards = await this.rewardRepository.find({
          where: {
            businessId: clientCard.businessId,
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

    return {
      totalStamps,
      activeClients,
      rewardsExchanged,
      clientRetention,
      recentClients,
      // TODO: Implementar métricas de recompensas
      totalRedemptions: 0,
      pendingRedemptions: 0,
      recentRedemptions: [],
      // Porcentajes de crecimiento
      stampsGrowth: Math.round(stampsGrowth * 10) / 10, // Redondear a 1 decimal
      clientsGrowth: Math.round(clientsGrowth * 10) / 10,
      rewardsGrowth: Math.round(rewardsGrowth * 10) / 10,
      retentionGrowth: Math.round(retentionGrowth * 10) / 10,
    };
  }

  async update(
    id: number,
    updateBusinessDto: UpdateBusinessDto & { logoPath?: string },
  ): Promise<Business> {
    const business = await this.findOne(id);

    if (updateBusinessDto.password) {
      updateBusinessDto.password = await bcrypt.hash(
        updateBusinessDto.password,
        10,
      );
    }

    if (updateBusinessDto.type !== BusinessType.OTRO) {
      updateBusinessDto.customType = undefined;
    }

    Object.assign(business, updateBusinessDto);
    return await this.businessRepository.save(business);
  }

  async remove(id: number): Promise<void> {
    const business = await this.findOne(id);
    await this.businessRepository.remove(business);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async validateBusiness(
    email: string,
    password: string,
  ): Promise<Business | null> {
    const business = await this.findByEmail(email);
    if (
      business &&
      (await this.validatePassword(password, business.password))
    ) {
      return business;
    }
    return null;
  }

  generateToken(business: Business): string {
    const payload = {
      sub: business.id,
      username: business.email, // Usar email como username
      email: business.email,
      type: 'business',
    };
    return this.jwtService.sign(payload);
  }
}
