import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly users: Array<{
    userId: number;
    username: string;
    passwordHash: string;
  }> = [];

  constructor() {
    // Seed user demo. En entornos reales se debe leer de base de datos
    const demoPasswordHash = bcrypt.hashSync('changeme', 10);
    this.users.push({
      userId: 1,
      username: 'john',
      passwordHash: demoPasswordHash,
    });
  }

  findOne(username: string) {
    return this.users.find((user) => user.username === username);
  }

  async validatePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
