import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { JwtService } from '@nestjs/jwt';
import { GoogleUser } from './google.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private clientsService: ClientsService,
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

  async validateGoogleUser(googleUser: GoogleUser): Promise<{
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    provider: string;
  }> {
    console.log('🔍 Validando usuario de Google OAuth:', googleUser.email);

    // Buscar o crear cliente basado en el email de Google
    const client =
      await this.clientsService.findOrCreateGoogleClient(googleUser);

    console.log('✅ Cliente procesado:', {
      id: client.id,
      email: client.email,
      provider: client.provider,
    });

    return {
      userId: client.id,
      username: client.email, // Usar email como username para clientes
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      picture: client.profilePicture || googleUser.picture,
      provider: client.provider,
    };
  }

  login(user: { username: string; userId: number }) {
    const payload = {
      username: user.username,
      sub: user.userId,
      type: 'business', // Identificar que es un negocio
    };
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
    console.log('🔐 Generando token para cliente de Google OAuth:', user.email);

    const payload = {
      username: user.username,
      sub: user.userId,
      email: user.email,
      provider: user.provider,
      type: 'client', // Identificar que es un cliente
    };

    const token = this.jwtService.sign(payload);

    console.log('✅ Token generado exitosamente para cliente:', user.email);

    return {
      access_token: token,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        provider: user.provider,
        type: 'client',
      },
    };
  }
}
