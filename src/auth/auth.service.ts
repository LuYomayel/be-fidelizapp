import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<{ userId: number; username: string } | null> {
    const user = this.usersService.findOne(username);
    if (
      user &&
      (await this.usersService.validatePassword(pass, user.passwordHash))
    ) {
      return { userId: user.userId, username: user.username };
    }
    return null;
  }

  login(user: { username: string; userId: number }) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
