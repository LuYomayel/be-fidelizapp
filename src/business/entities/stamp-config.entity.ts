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
import { StampType, PurchaseType, IStampConfig } from '@shared';
import { Business } from './business.entity';

@Entity('stamp_configs')
@Index(['businessId', 'isActive'])
export class StampConfig implements IStampConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'business_id' })
  businessId: number;

  @Column({ length: 100 })
  name: string; // Nombre del tipo de código (ej: "Compra Pequeña", "Visita Regular")

  @Column({ length: 500, nullable: true })
  description?: string; // Descripción del tipo de código

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
  stampValue: number; // Cantidad de sellos que otorga

  @Column({
    name: 'min_purchase_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minPurchaseAmount?: number; // Monto mínimo de compra requerido

  @Column({
    name: 'max_purchase_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maxPurchaseAmount?: number; // Monto máximo de compra para este tipo

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_quick_action', type: 'boolean', default: false })
  isQuickAction: boolean; // Si aparece en acciones rápidas

  @Column({ name: 'button_color', length: 7, nullable: true })
  buttonColor?: string; // Color del botón en hex (ej: #FF5733)

  @Column({ name: 'button_text', length: 50, nullable: true })
  buttonText?: string; // Texto personalizado del botón

  @Column({ name: 'icon_name', length: 50, nullable: true })
  iconName?: string; // Nombre del icono (para usar con Lucide)

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number; // Orden de aparición

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Business, { eager: true })
  @JoinColumn({ name: 'business_id' })
  business: Business;
}
