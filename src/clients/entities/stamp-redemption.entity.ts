import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IStampRedemption } from '@shared';
import { Client } from './client.entity';

@Entity('stamp_redemptions')
@Index(['clientId', 'stampId'], { unique: true })
@Index(['clientCardId'])
@Index(['redeemedAt'])
export class StampRedemption implements IStampRedemption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stamp_id' })
  stampId: number;

  @Column({ name: 'client_id' })
  clientId: number;

  @Column({ name: 'client_card_id' })
  clientCardId: number;

  @CreateDateColumn({ name: 'redeemed_at' })
  redeemedAt: Date;

  // Relaciones usando string references para evitar imports circulares
  @ManyToOne('Stamp', { eager: true })
  @JoinColumn({ name: 'stamp_id' })
  stamp: any;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne('ClientCard', { eager: true })
  @JoinColumn({ name: 'client_card_id' })
  clientCard: any;
}
