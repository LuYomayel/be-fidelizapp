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
import { IStampRule } from '@shared';
import { Business } from './business.entity';

@Entity('stamp_rules')
@Index(['businessId', 'isActive'])
export class StampRule implements IStampRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'business_id' })
  businessId: number;

  @Column({ length: 100 })
  name: string; // Nombre de la regla (ej: "Compra Pequeña", "Compra Grande")

  @Column({ length: 500, nullable: true })
  description?: string; // Descripción de la regla

  @Column({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2 })
  minAmount: number; // Monto mínimo para aplicar la regla

  @Column({
    name: 'max_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxAmount?: number; // Monto máximo (null = sin límite superior)

  @Column({ name: 'stamps_awarded', type: 'int' })
  stampsAwarded: number; // Cantidad de sellos otorgados

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number; // Orden de aplicación (se evalúa de menor a mayor)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Business, { eager: true })
  @JoinColumn({ name: 'business_id' })
  business: Business;
}
