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
import { IDashboard } from 'shared';
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

    // Total de sellos generados
    const totalStamps = await this.stampRepository.count({
      where: { businessId: business.id },
    });

    // Clientes activos (que tienen tarjeta)
    const activeClients = await this.clientCardRepository.count({
      where: { businessId: business.id },
    });

    // Recompensas canjeadas (CORRECTO: cuenta canjes de recompensas, no sellos)
    const rewardsExchanged = await this.rewardRedemptionRepository.count({
      where: { businessId: business.id },
    });

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

    // Clientes recientes
    const recentClients = await this.clientCardRepository.find({
      where: { businessId: business.id },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['client'],
    });

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
