import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { StampService } from './stamp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateStampDto,
  QuickStampDto,
  StampResponseDto,
  RedeemStampResponseDto,
} from '../common/dto/stamp.dto';

@ApiTags('🎫 Sistema de Sellos - Negocio')
@Controller('business/stamps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StampController {
  constructor(private readonly stampService: StampService) {}

  @Post('quick')
  @ApiOperation({
    summary: '⚡ Generar código rápido por valor de venta',
    description:
      'Genera un código de 6 dígitos de forma rápida basándose en el valor de la venta. Ideal para uso en punto de venta.',
  })
  @ApiBody({ type: QuickStampDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Código generado exitosamente',
    type: StampResponseDto,
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          code: '123456',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
          stampType: 'compra',
          stampValue: 2,
          description: 'Café grande',
          status: 'activo',
          expiresAt: '2024-01-15T10:35:00.000Z',
          createdAt: '2024-01-15T10:30:00.000Z',
          business: {
            id: 1,
            businessName: 'Cafetería La Esquina',
            logoPath: '/uploads/logos/logo-123.jpg',
            type: 'Cafeteria',
          },
        },
        message: 'Código generado exitosamente',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error en los datos de entrada',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticación inválido',
  })
  async createQuickStamp(
    @Request() req: any,
    @Body() quickStampDto: QuickStampDto,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const businessId = req.user.userId;
    // Crear DTO compatible basado en valor de venta
    const createStampDto: CreateStampDto = {
      stampType: 'compra' as any,
      stampValue:
        quickStampDto.saleValue >= 2500
          ? 3
          : quickStampDto.saleValue >= 1500
            ? 2
            : 1,
      description:
        quickStampDto.description || `Venta por $${quickStampDto.saleValue}`,
    };
    console.log('createStampDto', createStampDto);
    const stamp = await this.stampService.createStamp(
      businessId,
      createStampDto,
    );
    console.log('stamp', stamp);
    return {
      success: true,
      data: stamp,
      message: 'Código generado exitosamente',
    };
  }

  @Post()
  @ApiOperation({
    summary: '🎯 Generar sello personalizado',
    description:
      'Genera un sello con configuración avanzada, incluyendo tipo específico, valor personalizado y fecha de expiración.',
  })
  @ApiBody({ type: CreateStampDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sello generado exitosamente',
    type: StampResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error en los datos de entrada',
  })
  async createStamp(
    @Request() req: any,
    @Body() createStampDto: CreateStampDto,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const businessId = req.user.businessId || req.user.id;
    const stamp = await this.stampService.createStamp(
      businessId,
      createStampDto,
    );

    return {
      success: true,
      data: stamp,
      message: 'Sello generado exitosamente',
    };
  }

  @Get()
  @ApiOperation({
    summary: '📋 Obtener historial de sellos',
    description:
      'Obtiene todos los sellos generados por el negocio con paginación.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (por defecto: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página (por defecto: 10)',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de sellos obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          stamps: [
            {
              id: 1,
              code: '123456',
              stampType: 'compra',
              stampValue: 2,
              description: 'Café grande',
              status: 'usado',
              createdAt: '2024-01-15T10:30:00.000Z',
            },
          ],
          total: 50,
          page: 1,
          totalPages: 5,
        },
        message: 'Sellos obtenidos exitosamente',
      },
    },
  })
  async getStamps(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const businessId = req.user.businessId || req.user.id;
    const result = await this.stampService.getStampsByBusiness(
      businessId,
      page,
      limit,
    );

    return {
      success: true,
      data: result,
      message: 'Sellos obtenidos exitosamente',
    };
  }

  @Get('statistics')
  @ApiOperation({
    summary: '📊 Estadísticas de sellos',
    description:
      'Obtiene estadísticas detalladas sobre los sellos generados y su uso.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          totalGenerated: 120,
          totalUsed: 95,
          totalExpired: 15,
          totalActive: 10,
          recentStamps: [],
        },
        message: 'Estadísticas obtenidas exitosamente',
      },
    },
  })
  async getStampStatistics(
    @Request() req: any,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const businessId = req.user.businessId || req.user.id;
    const statistics = await this.stampService.getStampStatistics(businessId);

    return {
      success: true,
      data: statistics,
      message: 'Estadísticas obtenidas exitosamente',
    };
  }

  @Get(':code')
  @ApiOperation({
    summary: '🔍 Buscar sello por código',
    description:
      'Obtiene información detallada de un sello específico mediante su código.',
  })
  @ApiParam({
    name: 'code',
    description: 'Código del sello (6 dígitos)',
    example: '123456',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Información del sello obtenida exitosamente',
    type: StampResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Código no encontrado',
  })
  async getStampByCode(
    @Param('code') code: string,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const stamp = await this.stampService.getStampByCode(code);

    return {
      success: true,
      data: stamp,
      message: 'Información del sello obtenida exitosamente',
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: '❌ Cancelar sello',
    description: 'Cancela un sello activo para evitar que pueda ser usado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del sello a cancelar',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sello cancelado exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          code: '123456',
          status: 'cancelado',
        },
        message: 'Sello cancelado exitosamente',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sello no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Solo se pueden cancelar sellos activos',
  })
  async cancelStamp(
    @Request() req: any,
    @Param('id', ParseIntPipe) stampId: number,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const businessId = req.user.businessId || req.user.id;
    const stamp = await this.stampService.cancelStamp(stampId, businessId);

    return {
      success: true,
      data: stamp,
      message: 'Sello cancelado exitosamente',
    };
  }
}
