import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProvider } from '@shared';
import { IClient } from '@shared';

@Entity('clients')
export class Client implements IClient {
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

  @Column({ type: 'text', nullable: true })
  profilePicture: string;

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

  @Column({ default: true })
  mustChangePassword: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
