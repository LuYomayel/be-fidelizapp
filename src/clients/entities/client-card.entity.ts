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
import { IClientCard, StampRedemption } from '@shared';
import { Client } from './client.entity';
import { Business } from '../../business/entities/business.entity';

@Entity('client_cards')
@Index(['clientId', 'businessId'], { unique: true })
@Index(['businessId'])
export class ClientCard implements IClientCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'client_id' })
  clientId: number;

  @Column({ name: 'business_id' })
  businessId: number;

  @Column({ name: 'total_stamps', type: 'int', default: 0 })
  totalStamps: number;

  @Column({ name: 'available_stamps', type: 'int', default: 0 })
  availableStamps: number;

  @Column({ name: 'used_stamps', type: 'int', default: 0 })
  usedStamps: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ name: 'last_stamp_date', nullable: true })
  lastStampDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Business, { eager: true })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @OneToMany('StampRedemption', 'clientCard')
  redemptions: StampRedemption[];
}
