import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Business } from './business.entity';
import { IReward, RewardType } from '@shared';

@Entity('rewards')
@Index(['businessId', 'active'])
export class Reward implements IReward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RewardType })
  type: RewardType;

  @Column({ nullable: true })
  typeDescription?: string;

  @Column({ name: 'business_id' })
  businessId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'required_stamps', type: 'int' })
  requiredStamps: number; // Cantidad de sellos necesarios para canjear

  @Column({ name: 'stamps_cost', type: 'int' })
  stampsCost: number; // Cantidad de sellos que cuesta la recompensa

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  expirationDate?: Date;

  @Column({ type: 'int', nullable: true })
  stock?: number; // Stock disponible (-1 = ilimitado)

  @Column({ name: 'special_conditions', type: 'text', nullable: true })
  specialConditions?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Business, { eager: true })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @OneToMany('RewardRedemption', 'reward')
  redemptions: any[];
}
