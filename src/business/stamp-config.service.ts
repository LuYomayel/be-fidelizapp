import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StampConfig } from './entities/stamp-config.entity';
import {
  ICreateStampConfigDto,
  IUpdateStampConfigDto,
  IStampConfig,
  StampType,
  PurchaseType,
} from '@shared';

@Injectable()
export class StampConfigService {
  constructor(
    @InjectRepository(StampConfig)
    private readonly stampConfigRepository: Repository<StampConfig>,
  ) {}

  async create(
    businessId: number,
    createStampConfigDto: ICreateStampConfigDto,
  ): Promise<IStampConfig> {
    const stampConfig = this.stampConfigRepository.create({
      ...createStampConfigDto,
      businessId,
    });

    return await this.stampConfigRepository.save(stampConfig);
  }

  async findAllByBusiness(businessId: number): Promise<IStampConfig[]> {
    return await this.stampConfigRepository.find({
      where: { businessId },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async getQuickActions(businessId: number): Promise<IStampConfig[]> {
    return await this.stampConfigRepository.find({
      where: {
        businessId,
        isActive: true,
        isQuickAction: true,
      },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: number, businessId: number): Promise<IStampConfig> {
    const stampConfig = await this.stampConfigRepository.findOne({
      where: { id, businessId },
    });

    if (!stampConfig) {
      throw new NotFoundException('Configuración de sello no encontrada');
    }

    return stampConfig;
  }

  async update(
    id: number,
    businessId: number,
    updateStampConfigDto: IUpdateStampConfigDto,
  ): Promise<IStampConfig> {
    await this.findOne(id, businessId);

    await this.stampConfigRepository.update(
      { id, businessId },
      updateStampConfigDto,
    );

    return await this.findOne(id, businessId);
  }

  async remove(id: number, businessId: number): Promise<void> {
    await this.findOne(id, businessId);

    await this.stampConfigRepository.delete({ id, businessId });
  }

  async toggleActive(id: number, businessId: number): Promise<IStampConfig> {
    const stampConfig = await this.findOne(id, businessId);

    await this.stampConfigRepository.update(
      { id, businessId },
      { isActive: !stampConfig.isActive },
    );

    return await this.findOne(id, businessId);
  }

  async toggleQuickAction(
    id: number,
    businessId: number,
  ): Promise<IStampConfig> {
    const stampConfig = await this.findOne(id, businessId);

    await this.stampConfigRepository.update(
      { id, businessId },
      { isQuickAction: !stampConfig.isQuickAction },
    );

    return await this.findOne(id, businessId);
  }

  // Método para crear configuraciones por defecto para un nuevo negocio
  async createDefaultConfigs(businessId: number): Promise<void> {
    const defaultConfigs: ICreateStampConfigDto[] = [
      {
        name: 'Compra Pequeña',
        description: 'Compras de hasta $1500',
        stampType: StampType.PURCHASE,
        purchaseType: PurchaseType.SMALL,
        stampValue: 1,
        minPurchaseAmount: 0,
        maxPurchaseAmount: 1500,
        isActive: true,
        isQuickAction: true,
        buttonColor: '#3B82F6',
        buttonText: 'Compra Pequeña',
        iconName: 'ShoppingCart',
        sortOrder: 1,
      },
      {
        name: 'Compra Mediana',
        description: 'Compras de $1501 a $2500',
        stampType: StampType.PURCHASE,
        purchaseType: PurchaseType.MEDIUM,
        stampValue: 2,
        minPurchaseAmount: 1501,
        maxPurchaseAmount: 2500,
        isActive: true,
        isQuickAction: true,
        buttonColor: '#F59E0B',
        buttonText: 'Compra Mediana',
        iconName: 'ShoppingBag',
        sortOrder: 2,
      },
      {
        name: 'Compra Grande',
        description: 'Compras de más de $2500',
        stampType: StampType.PURCHASE,
        purchaseType: PurchaseType.LARGE,
        stampValue: 3,
        minPurchaseAmount: 2501,
        isActive: true,
        isQuickAction: true,
        buttonColor: '#10B981',
        buttonText: 'Compra Grande',
        iconName: 'ShoppingCart',
        sortOrder: 3,
      },
      {
        name: 'Visita Regular',
        description: 'Visita sin compra',
        stampType: StampType.VISIT,
        stampValue: 1,
        isActive: true,
        isQuickAction: false,
        buttonColor: '#8B5CF6',
        buttonText: 'Visita',
        iconName: 'MapPin',
        sortOrder: 4,
      },
    ];

    for (const config of defaultConfigs) {
      await this.create(businessId, config);
    }
  }
}
