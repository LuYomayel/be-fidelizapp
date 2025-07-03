import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessSize, BusinessType, IBusiness } from '../../../shared';

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

  @Column({ length: 20, nullable: true })
  internalPhone: string;

  @Column({ length: 20, nullable: true })
  externalPhone?: string;

  @Column({
    type: 'enum',
    enum: BusinessSize,
  })
  size: BusinessSize;

  @Column({ length: 255 })
  street: string;

  @Column({ length: 100 })
  neighborhood: string;

  @Column({ length: 10 })
  postalCode: string;

  @Column({ length: 100 })
  province: string;

  @Column({ nullable: true })
  logoPath?: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
  })
  type: BusinessType;

  @Column({ nullable: true, length: 255 })
  instagram?: string;

  @Column({ nullable: true, length: 255 })
  tiktok?: string;

  @Column({ nullable: true, length: 255 })
  website?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
