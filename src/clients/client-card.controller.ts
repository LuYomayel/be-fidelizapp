import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { StampService } from '../business/stamp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  RedeemStampDto,
  ClientCardResponseDto,
  RedeemStampResponseDto,
} from '../common/dto/stamp.dto';

@ApiTags('🎯 Sistema de Tarjetas - Cliente')
@Controller('client-cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientCardController {
  constructor(private readonly stampService: StampService) {}

  @Post('redeem')
  @ApiOperation({
    summary: '🎟️ Canjear código de sello',
    description:
      'Permite a un cliente canjear un código de 6 dígitos para obtener sellos en su tarjeta de fidelización.',
  })
  @ApiBody({ type: RedeemStampDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Código canjeado exitosamente',
    type: RedeemStampResponseDto,
    schema: {
      example: {
        success: true,
        data: {
          message: '¡Código canjeado exitosamente!',
          stamp: {
            id: 1,
            code: '123456',
            stampType: 'compra',
            stampValue: 2,
            description: 'Café grande',
            status: 'usado',
            createdAt: '2024-01-15T10:30:00.000Z',
            business: {
              id: 1,
              businessName: 'Cafetería La Esquina',
              logoPath: '/uploads/logos/logo-123.jpg',
              type: 'Cafeteria',
            },
          },
          clientCard: {
            id: 1,
            totalStamps: 12,
            availableStamps: 12,
            usedStamps: 0,
            level: 1,
            lastStampDate: '2024-01-15T10:30:00.000Z',
            business: {
              id: 1,
              businessName: 'Cafetería La Esquina',
              logoPath: '/uploads/logos/logo-123.jpg',
              type: 'Cafeteria',
              stampsForReward: 10,
              rewardDescription: 'Café gratis',
            },
          },
          stampsEarned: 2,
        },
        message: 'Código canjeado exitosamente',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Código inválido, expirado o ya utilizado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Código no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticación inválido',
  })
  async redeemStamp(
    @Request() req: any,
    @Body() redeemStampDto: RedeemStampDto,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const clientId = req.user.userId;
    const result = await this.stampService.redeemStamp(
      clientId,
      redeemStampDto.code,
    );

    return {
      success: true,
      data: result,
      message: 'Código canjeado exitosamente',
    };
  }

  @Get()
  @ApiOperation({
    summary: '💳 Obtener todas las tarjetas',
    description:
      'Obtiene todas las tarjetas de fidelización del cliente con información detallada de cada negocio.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tarjetas obtenidas exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          cards: [
            {
              id: 1,
              totalStamps: 12,
              availableStamps: 12,
              usedStamps: 0,
              level: 1,
              lastStampDate: '2024-01-15T10:30:00.000Z',
              business: {
                id: 1,
                businessName: 'Cafetería La Esquina',
                logoPath: '/uploads/logos/logo-123.jpg',
                type: 'Cafeteria',
                stampsForReward: 10,
                rewardDescription: 'Café gratis',
              },
            },
          ],
          total: 1,
        },
        message: 'Tarjetas obtenidas exitosamente',
      },
    },
  })
  async getClientCards(
    @Request() req: any,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const clientId = req.user.userId;
    const cards = await this.stampService.getClientCards(clientId);

    return {
      success: true,
      data: cards, // Retornar directamente el array
      message: 'Tarjetas obtenidas exitosamente',
    };
  }

  @Get(':businessId')
  @ApiOperation({
    summary: '🏪 Obtener tarjeta por negocio',
    description:
      'Obtiene la tarjeta de fidelización específica del cliente para un negocio determinado.',
  })
  @ApiParam({
    name: 'businessId',
    description: 'ID del negocio',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tarjeta obtenida exitosamente',
    type: ClientCardResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tarjeta no encontrada',
  })
  async getClientCardByBusiness(
    @Request() req: any,
    @Param('businessId', ParseIntPipe) businessId: number,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const clientId = req.user.userId;
    const card = await this.stampService.getClientCardByBusiness(
      clientId,
      businessId,
    );

    return {
      success: true,
      data: card,
      message: 'Tarjeta obtenida exitosamente',
    };
  }

  @Get(':businessId/history')
  @ApiOperation({
    summary: '📊 Historial de canjes por negocio',
    description:
      'Obtiene el historial completo de canjes realizados por el cliente en un negocio específico.',
  })
  @ApiParam({
    name: 'businessId',
    description: 'ID del negocio',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historial obtenido exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          history: [
            {
              id: 1,
              stampsEarned: 2,
              redeemedAt: '2024-01-15T10:30:00.000Z',
              stamp: {
                id: 1,
                code: '123456',
                description: 'Café grande',
                stampValue: 2,
              },
            },
          ],
          total: 1,
        },
        message: 'Historial obtenido exitosamente',
      },
    },
  })
  async getRedemptionHistory(
    @Request() req: any,
    @Param('businessId', ParseIntPipe) businessId: number,
  ): Promise<{ success: boolean; data: any; message: string }> {
    const clientId = req.user.userId;
    const history = await this.stampService.getRedemptionHistory(
      clientId,
      businessId,
    );

    return {
      success: true,
      data: history, // Retornar directamente el array
      message: 'Historial obtenido exitosamente',
    };
  }
}
