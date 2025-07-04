import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  username: string;
  sub: number;
  email?: string;
  type?: 'business' | 'client';
  provider?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: new ConfigService().get<string>('JWT_SECRET') || 'secretKey',
    });
  }

  validate(payload: JwtPayload) {
    // Retornar información completa del usuario basada en el tipo
    if (payload.type === 'client') {
      return {
        userId: payload.sub,
        clientId: payload.sub, // Para compatibilidad con endpoints de clientes
        username: payload.username,
        email: payload.email,
        type: 'client',
        provider: payload.provider,
      };
    } else {
      // Para negocios (business)
      return {
        userId: payload.sub,
        businessId: payload.sub, // Para compatibilidad con endpoints de negocios
        username: payload.username,
        type: 'business',
      };
    }
  }
}
