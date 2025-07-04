import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { GoogleUser } from './google.strategy';

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

  validateGoogleUser(googleUser: GoogleUser): {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    provider: string;
  } {
    // Buscar o crear usuario basado en el email de Google
    let user = this.usersService.findByEmail(googleUser.email);

    if (!user) {
      // Crear nuevo usuario si no existe
      user = this.usersService.createGoogleUser(googleUser);
    }

    return {
      userId: user.userId,
      username: user.username,
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      picture: googleUser.picture,
      provider: 'google',
    };
  }

  login(user: { username: string; userId: number }) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  loginWithGoogle(user: {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    provider: string;
  }) {
    const payload = {
      username: user.username,
      sub: user.userId,
      email: user.email,
      provider: user.provider,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        provider: user.provider,
      },
    };
  }
}
