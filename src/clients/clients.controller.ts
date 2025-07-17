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
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import {
  CreateClientDto,
  UpdateClientDto,
  LoginClientDto,
} from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { UserProvider } from '@shared';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un cliente' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async register(@Body() createClientDto: CreateClientDto) {
    try {
      const client = await this.clientsService.create(createClientDto);
      return {
        success: true,
        data: client,
        message: 'Cliente registrado exitosamente',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al registrar cliente';
      return {
        success: false,
        data: null,
        message: errorMessage,
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
  async verifyEmail(@Body() verifyEmailDto: { email: string; code: string }) {
    try {
      const result = await this.clientsService.verifyEmail(
        verifyEmailDto.email,
        verifyEmailDto.code,
      );

      if (result.success && result.client) {
        // Generar tokens de autenticación para el cliente
        const clientUser = {
          userId: result.client.id,
          username:
            `${result.client.firstName || ''} ${result.client.lastName || ''}`.trim(),
          email: result.client.email,
          emailVerified: result.client.emailVerified,
          provider: result.client.provider as 'email' | 'google',
        };

        const authResult = this.authService.loginClient(clientUser);

        return {
          success: true,
          data: {
            client: authResult.user,
            token: authResult.access_token,
          },
          message: 'Email verificado exitosamente',
        };
      }

      return {
        success: result.success,
        data: null,
        message: result.message,
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al verificar email';
      return {
        success: false,
        data: null,
        message: errorMessage,
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
  async resendVerification(@Body() resendDto: { email: string }) {
    try {
      await this.clientsService.sendVerificationCode(resendDto.email);
      return {
        success: true,
        data: null,
        message: 'Código de verificación enviado',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al enviar código';
      return {
        success: false,
        data: null,
        message: errorMessage,
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
  async forgotPassword(@Body() forgotPasswordDto: { email: string }) {
    try {
      const result = await this.clientsService.sendPasswordResetCode(
        forgotPasswordDto.email,
      );
      return {
        success: result.success,
        data: null,
        message: result.message,
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al enviar código';
      return {
        success: false,
        data: null,
        message: errorMessage,
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

  @Post('change-password')
  @ApiOperation({ summary: 'Cambiar contraseña después de verificación' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        newPassword: { type: 'string', minLength: 6 },
      },
      required: ['email', 'newPassword'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña cambiada correctamente',
  })
  @ApiResponse({ status: 400, description: 'Error al cambiar la contraseña' })
  async changePassword(@Body() body: { email: string; newPassword: string }) {
    try {
      const result = await this.clientsService.changePassword(
        body.email,
        body.newPassword,
      );
      if (result.success && result.client) {
        // Generar token y datos de cliente igual que en login
        const authResult = this.authService.loginClient(result.client);
        return {
          success: true,
          data: {
            client: authResult.user,
            token: authResult.access_token,
            tokens: {
              accessToken: authResult.access_token,
              refreshToken: authResult.access_token,
            },
          },
          message: result.message,
        };
      }
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al cambiar la contraseña',
      };
    }
  }

  @Post('change-password-recovery')
  @ApiOperation({ summary: 'Cambiar contraseña después de recuperación' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        newPassword: { type: 'string', minLength: 6 },
      },
      required: ['email', 'newPassword'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña cambiada correctamente',
  })
  @ApiResponse({ status: 400, description: 'Error al cambiar la contraseña' })
  async changePasswordAfterRecovery(
    @Body() body: { email: string; newPassword: string },
  ) {
    try {
      const result = await this.clientsService.changePasswordAfterRecovery(
        body.email,
        body.newPassword,
      );
      if (result.success && result.client) {
        // Generar token y datos de cliente igual que en login
        const authResult = this.authService.loginClient(result.client);
        return {
          success: true,
          data: {
            client: authResult.user,
            token: authResult.access_token,
            tokens: {
              accessToken: authResult.access_token,
              refreshToken: authResult.access_token,
            },
          },
          message: result.message,
        };
      }
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al cambiar la contraseña',
      };
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión de cliente' })
  @ApiBody({ type: LoginClientDto })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginClientDto: LoginClientDto) {
    try {
      // Validar credenciales usando el nuevo método
      const validation = await this.clientsService.validateClient(
        loginClientDto.email,
        loginClientDto.password,
      );

      if (!validation.client) {
        if (validation.needsVerification) {
          return {
            success: false,
            data: null,
            message: 'Debes verificar tu email antes de iniciar sesión',
            requiresVerification: true,
            email: loginClientDto.email,
          };
        }
        return {
          success: false,
          data: null,
          message: 'Credenciales inválidas',
        };
      }

      // Usar el método loginClient del AuthService
      const clientUser = {
        userId: validation.client.id,
        username:
          `${validation.client.firstName || ''} ${validation.client.lastName || ''}`.trim(),
        email: validation.client.email,
        emailVerified: validation.client.emailVerified,
        provider: validation.client.provider,
      };

      const result = this.authService.loginClient(clientUser);

      return {
        success: true,
        data: {
          client: result.user,
          token: result.access_token,
          tokens: {
            accessToken: result.access_token,
            refreshToken: result.access_token, // Por ahora usamos el mismo token
          },
        },
        message: 'Inicio de sesión exitoso',
        mustChangePassword: validation.mustChangePassword,
      };
    } catch (error: any) {
      console.error('Error en login de cliente:', error);
      return {
        success: false,
        data: null,
        message: 'Error al iniciar sesión',
      };
    }
  }

  @Post('validate-recovery-code')
  @ApiOperation({ summary: 'Validar código de recuperación' })
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
  @ApiResponse({
    status: 200,
    description: 'Código validado correctamente',
  })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado' })
  async validateRecoveryCode(@Body() body: { email: string; code: string }) {
    try {
      const result = await this.clientsService.validateRecoveryCode(
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
        message: error.message || 'Error al validar el código',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    try {
      const clients = await this.clientsService.findAll();
      return {
        success: true,
        data: clients,
        message: 'Clientes obtenidos exitosamente',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al obtener clientes';
      return {
        success: false,
        data: null,
        message: errorMessage,
      };
    }
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
