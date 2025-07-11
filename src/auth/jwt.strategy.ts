import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import {
  JwtPayload,
  ClientUser,
  BusinessUser,
  AuthenticatedUser,
} from '@shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: new ConfigService().get<string>('JWT_SECRET') || 'secretKey',
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    // Retornar información completa del usuario basada en el tipo
    if (payload.type === 'client') {
      const clientUser: ClientUser = {
        userId: payload.sub,
        clientId: payload.sub, // Para compatibilidad con endpoints de clientes
        username: payload.username,
        email: payload.email,
        emailVerified: true, // Los usuarios con JWT ya están verificados
        type: 'client',
        provider: payload.provider,
      };
      return clientUser;
    } else {
      // Para negocios (business)
      const businessUser: BusinessUser = {
        userId: payload.sub,
        businessId: payload.sub, // Para compatibilidad con endpoints de negocios
        username: payload.username,
        type: 'business',
        email: payload.email,
        emailVerified: true,
        provider: payload.provider,
      };
      return businessUser;
    }
  }
}
