import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import {
  CreateClientDto,
  UpdateClientDto,
  LoginClientDto,
} from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/local-auth.guard';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un cliente' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async create(@Body() createClientDto: CreateClientDto) {
    try {
      const result = await this.clientsService.create(createClientDto);
      return {
        success: true,
        data: {
          client: result.client,
          requiresVerification: result.requiresVerification,
        },
        message: result.requiresVerification
          ? 'Cliente registrado. Verifica tu email para completar el registro.'
          : 'Cliente registrado exitosamente',
      };
    } catch (error: any) {
      console.log(error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : 'Error al registrar el cliente',
      };
    }
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verificar email con código' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        code: { type: 'string', minLength: 6, maxLength: 6 },
      },
      required: ['email', 'code'],
    },
  })
  @ApiResponse({ status: 200, description: 'Email verificado correctamente' })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado' })
  async verifyEmail(@Body() body: { email: string; code: string }) {
    try {
      const result = await this.clientsService.verifyEmail(
        body.email,
        body.code,
      );
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al verificar el email',
      };
    }
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Reenviar código de verificación' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({ status: 200, description: 'Código de verificación reenviado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async resendVerification(@Body() body: { email: string }) {
    try {
      await this.clientsService.sendVerificationCode(body.email);
      return {
        success: true,
        message: 'Código de verificación reenviado',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al reenviar el código',
      };
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar código de recuperación de contraseña' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({ status: 200, description: 'Código de recuperación enviado' })
  async forgotPassword(@Body() body: { email: string }) {
    try {
      const result = await this.clientsService.sendPasswordResetCode(
        body.email,
      );
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al enviar el código de recuperación',
      };
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña con código' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        code: { type: 'string', minLength: 6, maxLength: 6 },
        newPassword: { type: 'string', minLength: 6 },
      },
      required: ['email', 'code', 'newPassword'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida correctamente',
  })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado' })
  async resetPassword(
    @Body() body: { email: string; code: string; newPassword: string },
  ) {
    try {
      const result = await this.clientsService.resetPassword(
        body.email,
        body.code,
        body.newPassword,
      );
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al restablecer la contraseña',
      };
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión de cliente' })
  @ApiBody({ type: LoginClientDto })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Request() req) {
    try {
      const client = req.user;

      // Verificar si el email está verificado
      if (!client.emailVerified) {
        return {
          success: false,
          data: null,
          message: 'Debes verificar tu email antes de iniciar sesión',
          requiresVerification: true,
          email: client.email,
        };
      }

      const token = this.clientsService.generateToken(client);
      return {
        success: true,
        data: {
          client,
          token,
          tokens: {
            accessToken: token,
            refreshToken: token, // Por ahora usamos el mismo token
          },
        },
        message: 'Inicio de sesión exitoso',
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.message || 'Error al iniciar sesión',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  findAll() {
    return this.clientsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cliente' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Cliente actualizado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(+id, updateClientDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }
}
