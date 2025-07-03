import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Request()
    req: ExpressRequest & { user: { userId: number; username: string } },
  ) {
    try {
      console.log('req', req);
      return this.authService.login(req.user);
    } catch (error) {
      console.log(error);
      return { success: false, data: null, message: 'Error al iniciar sesión' };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(
    @Request()
    req: ExpressRequest & { user: { userId: number; username: string } },
  ) {
    return req.user;
  }
}
