import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
  UsePipes,
  UseGuards,
  ParseIntPipe,
  Put,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BusinessService } from './business.service';
import {
  CreateBusinessDto,
  UpdateBusinessDto,
  LoginBusinessDto,
} from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

@ApiTags('business')
@Controller('business')
@UsePipes(new ValidationPipe())
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un negocio',
    description: 'Crea un nuevo negocio con opción de subir logo',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos del negocio a registrar',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        businessName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
        size: { type: 'string', enum: ['SMALL', 'MEDIUM', 'LARGE'] },
        street: { type: 'string' },
        neighborhood: { type: 'string' },
        postalCode: { type: 'string' },
        province: { type: 'string' },
        type: {
          type: 'string',
          enum: ['CAFETERIA', 'RESTAURANTE', 'PANADERIA', 'OTRO'],
        },
        customType: { type: 'string' },
        internalPhone: { type: 'string' },
        externalPhone: { type: 'string' },
        instagram: { type: 'string' },
        tiktok: { type: 'string' },
        website: { type: 'string' },
        logo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Negocio registrado exitosamente con autenticación automática',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            business: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string' },
                businessName: { type: 'string' },
                type: { type: 'string' },
                customType: { type: 'string' },
                logoPath: { type: 'string' },
              },
            },
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiConflictResponse({ description: 'El email ya está registrado' })
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'logo-' + uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Solo se permiten archivos de imagen'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    try {
      console.log('🔍 DEBUG - Registro de negocio:');
      console.log('- createBusinessDto:', createBusinessDto);
      console.log(
        '- logo recibido:',
        logo
          ? {
              fieldname: logo.fieldname,
              originalname: logo.originalname,
              encoding: logo.encoding,
              mimetype: logo.mimetype,
              size: logo.size,
              destination: logo.destination,
              filename: logo.filename,
              path: logo.path,
            }
          : 'No logo',
      );

      const logoPath = logo ? logo?.path : undefined;
      console.log('- logoPath final:', logoPath);

      const business = await this.businessService.create(
        createBusinessDto,
        logoPath,
      );

      // Generar token JWT automáticamente después del registro
      const token = this.businessService.generateToken(business);

      return {
        success: true,
        data: {
          business: {
            id: business.id,
            email: business.email,
            businessName: business.businessName,
            type: business.type,
            customType: business.customType,
            logoPath: business.logoPath,
          },
          tokens: {
            accessToken: token,
            refreshToken: token, // Por ahora usar el mismo token
          },
        },
        message: 'Negocio registrado exitosamente',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : 'Error al registrar el negocio',
      };
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login de negocio',
    description: 'Autenticación de negocios usando email y contraseña',
  })
  @ApiBody({
    type: LoginBusinessDto,
    description: 'Credenciales de acceso del negocio',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            business: { type: 'object' },
            token: { type: 'string' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginBusinessDto: LoginBusinessDto) {
    try {
      const business = await this.businessService.validateBusiness(
        loginBusinessDto.email,
        loginBusinessDto.password,
      );

      if (!business) {
        return {
          success: false,
          data: null,
          message: 'Credenciales inválidas',
        };
      }

      // Generar token JWT
      const token = this.businessService.generateToken(business);

      return {
        success: true,
        data: {
          business: {
            id: business.id,
            email: business.email,
            businessName: business.businessName,
          },
          token,
          tokens: {
            accessToken: token,
            refreshToken: token, // Por ahora usar el mismo token
          },
        },
        message: 'Login exitoso',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
        message: 'Error al iniciar sesión',
      };
    }
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener dashboard de negocio',
    description: 'Obtiene el dashboard de negocio',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard de negocio obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalStamps: {
              type: 'number',
              description: 'Total de sellos generados',
            },
            activeClients: {
              type: 'number',
              description: 'Número de clientes activos',
            },
            rewardsExchanged: {
              type: 'number',
              description: 'Total de recompensas canjeadas',
            },
            clientRetention: {
              type: 'number',
              description: 'Porcentaje de retención de clientes',
            },
            recentClients: {
              type: 'array',
              description: 'Lista de clientes recientes',
            },
            totalRedemptions: {
              type: 'number',
              description: 'Total de redenciones',
            },
            pendingRedemptions: {
              type: 'number',
              description: 'Redenciones pendientes',
            },
            recentRedemptions: {
              type: 'array',
              description: 'Redenciones recientes',
            },
            stampsGrowth: {
              type: 'number',
              description: 'Crecimiento de sellos vs mes anterior (%)',
            },
            clientsGrowth: {
              type: 'number',
              description: 'Crecimiento de clientes vs mes anterior (%)',
            },
            rewardsGrowth: {
              type: 'number',
              description: 'Crecimiento de recompensas vs mes anterior (%)',
            },
            retentionGrowth: {
              type: 'number',
              description: 'Crecimiento de retención vs mes anterior (%)',
            },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido' })
  async getDashboard(@Req() req: { user: { userId: number } }) {
    try {
      const dashboard = await this.businessService.getDashboard(
        req.user.userId,
      );
      return { success: true, data: dashboard };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener el dashboard',
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener todos los negocios',
    description: 'Lista todos los negocios registrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de negocios obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido' })
  async findAll() {
    try {
      const businesses = await this.businessService.findAll();
      return { success: true, data: businesses };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener los negocios',
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener un negocio por ID',
    description: 'Obtiene la información detallada de un negocio específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del negocio',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Negocio obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Negocio no encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const business = await this.businessService.findOne(id);
      return { success: true, data: business };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener el negocio',
      };
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar un negocio',
    description: 'Actualiza la información de un negocio existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del negocio',
    type: 'number',
    example: 1,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateBusinessDto,
    description: 'Datos actualizados del negocio',
  })
  @ApiResponse({
    status: 200,
    description: 'Negocio actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Negocio no encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido' })
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'logo-' + uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Solo se permiten archivos de imagen'), false);
        }
        cb(null, true);
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const logoPath = logo ? logo.path : undefined;
    const updateData = logoPath
      ? { ...updateBusinessDto, logoPath }
      : updateBusinessDto;
    try {
      const business = await this.businessService.update(id, updateData);
      return {
        success: true,
        data: business,
        message: 'Negocio actualizado exitosamente',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
        message: 'Error al actualizar el negocio',
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Eliminar un negocio',
    description: 'Elimina un negocio del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del negocio',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Negocio eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Negocio no encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.businessService.remove(id);
      return { success: true, message: 'Negocio eliminado exitosamente' };
    } catch (error) {
      console.log(error);
      return { success: false, message: 'Error al eliminar el negocio' };
    }
  }
}
