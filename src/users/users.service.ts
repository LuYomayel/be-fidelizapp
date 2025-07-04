import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { GoogleUser } from '../auth/google.strategy';

interface User {
  userId: number;
  username: string;
  passwordHash: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  provider?: string;
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  private userIdCounter = 1;

  constructor() {
    // Seed user demo. En entornos reales se debe leer de base de datos
    const demoPasswordHash = bcrypt.hashSync('changeme', 10);
    this.users.push({
      userId: this.userIdCounter++,
      username: 'john',
      passwordHash: demoPasswordHash,
      email: 'john@example.com',
    });
  }

  findOne(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  createGoogleUser(googleUser: GoogleUser): User {
    // Generar un username único basado en el email
    const username = googleUser.email.split('@')[0] + '_' + Date.now();

    const newUser: User = {
      userId: this.userIdCounter++,
      username,
      passwordHash: '', // Los usuarios de Google no necesitan contraseña
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      picture: googleUser.picture,
      provider: 'google',
    };

    this.users.push(newUser);
    return newUser;
  }

  async validatePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
