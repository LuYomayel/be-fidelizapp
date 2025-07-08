import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super(); // Config por defecto: username & password
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

@Injectable()
export class LocalClientStrategy extends PassportStrategy(
  Strategy,
  'local-client',
) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Usar email en lugar de username
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const client = await this.authService.validateClient(email, password);
    if (!client) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return client;
  }
}
