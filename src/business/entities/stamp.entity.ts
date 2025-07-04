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
import { StampType, StampStatus, PurchaseType, IStamp } from '@shared';
import { Business } from './business.entity';

@Entity('stamps')
@Index(['businessId', 'status'])
export class Stamp implements IStamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'business_id' })
  businessId: number;

  @Column({ unique: true, length: 12 })
  code: string;

  @Column({ name: 'qr_code', nullable: true, type: 'text' })
  qrCode?: string;

  @Column({
    name: 'stamp_type',
    type: 'enum',
    enum: StampType,
    default: StampType.PURCHASE,
  })
  stampType: StampType;

  @Column({
    name: 'purchase_type',
    type: 'enum',
    enum: PurchaseType,
    nullable: true,
  })
  purchaseType?: PurchaseType;

  @Column({ name: 'stamp_value', type: 'int', default: 1 })
  stampValue: number;

  @Column({ length: 500 })
  description: string;

  @Column({
    type: 'enum',
    enum: StampStatus,
    default: StampStatus.ACTIVE,
  })
  status: StampStatus;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'used_at', nullable: true })
  usedAt?: Date;

  @Column({ name: 'used_by', nullable: true })
  usedBy?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Business, { eager: true })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @OneToMany('StampRedemption', 'stamp')
  redemptions: any[];
}
