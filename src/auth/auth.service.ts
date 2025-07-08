import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { JwtService } from '@nestjs/jwt';
import { GoogleUser } from './google.strategy';
import { ClientJwtPayload, BusinessJwtPayload } from 'shared';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => ClientsService))
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

  async validateClient(
    email: string,
    password: string,
  ): Promise<{
    userId: number;
    username: string;
    email: string;
    emailVerified: boolean;
  } | null> {
    const client = await this.clientsService.validateClient(email, password);
    console.log('🔍 Validando cliente:', client);
    if (client) {
      return {
        userId: client.id,
        username: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
        email: client.email,
        emailVerified: client.emailVerified,
      };
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
      username: `${client.firstName || ''} ${client.lastName || ''}`.trim(), // Usar email como username para clientes
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      picture: client.profilePicture || googleUser.picture,
      provider: client.provider,
    };
  }

  login(user: {
    username: string;
    userId: number;
    email: string;
    provider: 'email' | 'google';
  }) {
    const payload: BusinessJwtPayload = {
      username: user.username,
      sub: user.userId,
      type: 'business', // Identificar que es un negocio
      email: user.email,
      emailVerified: true,
      provider: 'email',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  loginClient(user: {
    userId: number;
    username: string;
    email: string;
    emailVerified: boolean;
    provider: 'email' | 'google';
  }) {
    console.log('🔐 Generando token para cliente:', user);
    const payload: ClientJwtPayload = {
      username: user.username,
      sub: user.userId,
      email: user.email,
      type: 'client',
      provider: user.provider,
      emailVerified: user.emailVerified,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        type: 'client',
        provider: user.provider,
      },
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

    const payload: ClientJwtPayload = {
      username: user.username,
      sub: user.userId,
      email: user.email,
      provider: user.provider as 'email' | 'google',
      emailVerified: true,
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
        provider: user.provider as 'email' | 'google',
        type: 'client',
      },
    };
  }
}
