import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { Request as ExpressRequest, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { LoginBusinessDto } from '../business/dto/login-business.dto';

class LoginResponse {
  success: boolean;
  data: any;
  message: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login de negocio' })
  @ApiBody({ type: LoginBusinessDto })
  @SwaggerApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: LoginResponse,
  })
  login(@Body() loginBusinessDto: LoginBusinessDto): LoginResponse {
    try {
      const data = this.authService.login({
        username: loginBusinessDto.email,
        userId: 0, // o el valor que corresponda
      });
      return { success: true, data, message: 'Login exitoso' };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Error en login',
      };
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Iniciar autenticación con Google' })
  @SwaggerApiResponse({
    status: 302,
    description: 'Redirección a Google OAuth',
  })
  googleAuth() {
    // El guard redirige automáticamente a Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback de autenticación con Google' })
  @SwaggerApiResponse({
    status: 302,
    description: 'Redirección tras autenticación exitosa',
  })
  googleAuthRedirect(
    @Request() req: ExpressRequest & { user: any },
    @Res() res: Response,
  ) {
    try {
      const loginResult = this.authService.loginWithGoogle(req.user);

      // Construir URL de redirección con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/google/callback?token=${loginResult.access_token}&user=${encodeURIComponent(JSON.stringify(loginResult.user))}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error en callback de Google:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage =
        error instanceof Error ? error.message : 'Error de autenticación';
      res.redirect(
        `${frontendUrl}/auth/error?message=${encodeURIComponent(errorMessage)}`,
      );
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
