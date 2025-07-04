import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { LoginBusinessDto } from '../common/dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

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
  @ApiOperation({
    summary: 'Login de negocio',
    description: 'Autenticación de negocios usando email y contraseña',
  })
  @ApiBody({ type: LoginBusinessDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: LoginResponse,
  })
  @ApiBadRequestResponse({ description: 'Datos de login inválidos' })
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
  @ApiOperation({
    summary: 'Iniciar autenticación con Google',
    description:
      'Redirige al usuario a la página de autenticación de Google OAuth',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirección a Google OAuth',
  })
  @ApiExcludeEndpoint()
  googleAuth() {
    // El guard redirige automáticamente a Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Callback de autenticación con Google',
    description:
      'Endpoint que maneja la respuesta de Google OAuth y genera token JWT',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirección tras autenticación exitosa',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirección a página de error en caso de fallo',
  })
  @ApiExcludeEndpoint()
  async googleAuthRedirect(
    @Request() req: ExpressRequest & { user: any },
    @Res() res: Response,
  ) {
    try {
      console.log('🔄 Procesando callback de Google OAuth...');

      // Validar y procesar el usuario de Google
      const validatedUser = await this.authService.validateGoogleUser(req.user);

      // Generar token para el cliente
      const loginResult = this.authService.loginWithGoogle(validatedUser);

      // Construir URL de redirección con el token - PRODUCCIÓN
      const frontendUrl =
        process.env.FRONTEND_URL || 'https://fidelizapp.luciano-yomayel.com';
      const redirectUrl = `${frontendUrl}/auth/google/callback?token=${loginResult.access_token}&user=${encodeURIComponent(JSON.stringify(loginResult.user))}`;

      console.log('🔗 Redirigiendo a:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Error en callback de Google:', error);
      const frontendUrl =
        process.env.FRONTEND_URL || 'https://fidelizapp.luciano-yomayel.com';
      const errorMessage =
        error instanceof Error ? error.message : 'Error de autenticación';
      res.redirect(
        `${frontendUrl}/auth/error?message=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description:
      'Devuelve la información del usuario autenticado basado en el token JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number' },
        username: { type: 'string' },
        email: { type: 'string' },
        type: { type: 'string', enum: ['business', 'client'] },
        provider: { type: 'string', enum: ['email', 'google'] },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT inválido o expirado' })
  getProfile(
    @Request()
    req: ExpressRequest & { user: { userId: number; username: string } },
  ) {
    return req.user;
  }
}
