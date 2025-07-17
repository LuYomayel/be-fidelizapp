import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessSize, BusinessType, IBusiness } from '@shared';

@Entity('businesses')
export class Business implements IBusiness {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  businessName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ length: 100 })
  adminFirstName: string;

  @Column({ length: 100 })
  adminLastName: string;

  @Column({ length: 20, nullable: true })
  internalPhone: string;

  @Column({ length: 20, nullable: true })
  externalPhone?: string;

  @Column({
    type: 'enum',
    enum: BusinessSize,
  })
  size: BusinessSize;

  @Column({ length: 255, nullable: true })
  street: string;

  @Column({ length: 100, nullable: true })
  neighborhood: string;

  @Column({ length: 10, nullable: true })
  postalCode: string;

  @Column({ length: 100, nullable: true })
  province: string;

  @Column({ nullable: true })
  logoPath?: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
  })
  type: BusinessType;

  @Column({ nullable: true, length: 255 })
  customType?: string;

  @Column({ nullable: true, length: 255 })
  instagram?: string;

  @Column({ nullable: true, length: 255 })
  tiktok?: string;

  @Column({ nullable: true, length: 255 })
  website?: string;

  @Column({ name: 'stamps_for_reward', type: 'int', default: 10 })
  stampsForReward: number; // Cantidad de sellos necesarios para una recompensa

  @Column({ length: 255, nullable: true })
  rewardDescription?: string; // Descripción de la recompensa (ej: "Café gratis")

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true, length: 6 })
  emailVerificationCode?: string;

  @Column({ nullable: true })
  emailVerificationCodeExpiry?: Date;

  @Column({ default: true })
  mustChangePassword: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
