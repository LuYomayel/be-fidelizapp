import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProvider } from '@shared';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) // Opcional para usuarios de Google OAuth
  password?: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  // Campos para Google OAuth
  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true, length: 1024 })
  profilePicture?: string;

  @Column({
    type: 'enum',
    enum: UserProvider,
    default: UserProvider.EMAIL,
  })
  provider: UserProvider;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
