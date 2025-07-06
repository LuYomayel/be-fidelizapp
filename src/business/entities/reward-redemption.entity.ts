import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Reward } from './reward.entity';
import { ClientCard } from 'src/clients/entities/client-card.entity';

export enum RedemptionStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('reward_redemptions')
@Index(['clientId', 'rewardId'])
@Index(['businessId', 'redeemedAt'])
@Index(['redemptionCode'], { unique: true })
@Index(['status', 'businessId'])
export class RewardRedemption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reward_id' })
  rewardId: number;

  @Column({ name: 'client_id' })
  clientId: number;

  @Column({ name: 'client_card_id' })
  clientCardId: number;

  @Column({ name: 'business_id' })
  businessId: number;

  @Column({ name: 'stamps_spent', type: 'int' })
  stampsSpent: number; // Cantidad de sellos gastados

  @Column({ name: 'stamps_before', type: 'int' })
  stampsBefore: number; // Sellos antes del canje

  @Column({ name: 'stamps_after', type: 'int' })
  stampsAfter: number; // Sellos después del canje

  @Column({ name: 'redemption_code', length: 10, unique: true })
  redemptionCode: string; // Código único para mostrar al negocio

  @Column({
    type: 'enum',
    enum: RedemptionStatus,
    default: RedemptionStatus.PENDING,
  })
  status: RedemptionStatus;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date; // Fecha de expiración del código (24 horas)

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date; // Cuándo se entregó la recompensa física

  @Column({ name: 'delivered_by', nullable: true })
  deliveredBy?: string; // Quién entregó la recompensa (usuario admin)

  @Column({ length: 500, nullable: true })
  notes?: string; // Notas adicionales del canje

  @CreateDateColumn({ name: 'redeemed_at' })
  redeemedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne('Reward', { eager: true })
  @JoinColumn({ name: 'reward_id' })
  reward: Reward;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne('ClientCard', { eager: true })
  @JoinColumn({ name: 'client_card_id' })
  clientCard: ClientCard;
}
