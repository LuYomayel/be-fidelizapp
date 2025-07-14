import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  Put,
  Delete,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RewardService } from './reward.service';
import {
  ApiResponse as CustomApiResponse,
  IRedemptionTicket,
  IRedemptionDashboard,
  IDeliverRedemptionDto,
  IRedemptionFilters,
  RedemptionStatus,
  AuthenticatedRequest,
  IReward,
  BusinessRequest,
  RewardType,
  ClientRequest,
} from '@shared';

@ApiTags('rewards')
@Controller('rewards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva recompensa' })
  @ApiResponse({ status: 201, description: 'Recompensa creada exitosamente' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre de la recompensa' },
        description: {
          type: 'string',
          description: 'Descripción de la recompensa',
        },
        requiredStamps: {
          type: 'number',
          description: 'Sellos necesarios para canjear',
        },
        stampsCost: { type: 'number', description: 'Costo en sellos' },
        image: {
          type: 'string',
          description: 'URL de la imagen',
          required: ['false'],
        },
        expirationDate: {
          type: 'string',
          format: 'date-time',
          required: ['false'],
        },
        stock: {
          type: 'number',
          description: 'Stock disponible (-1 = ilimitado)',
          required: ['false'],
        },
        specialConditions: {
          type: 'string',
          description: 'Condiciones especiales',
          required: ['false'],
        },
      },
    },
  })
  async createReward(
    @Request() req: BusinessRequest,
    @Body()
    rewardData: {
      name: string;
      description: string;
      requiredStamps: number;
      stampsCost: number;
      image?: string;
      expirationDate?: Date;
      stock?: number;
      specialConditions?: string;
      type?: RewardType;
      typeDescription?: string;
    },
  ): Promise<CustomApiResponse<any>> {
    try {
      const businessId = req.user.userId;
      const reward = await this.rewardService.createReward(
        businessId,
        rewardData,
      );

      return {
        success: true,
        data: reward,
        message: 'Recompensa creada exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('my-rewards')
  @ApiOperation({ summary: 'Obtener recompensas del negocio' })
  @ApiResponse({ status: 200, description: 'Lista de recompensas' })
  async getBusinessRewards(
    @Request() req: BusinessRequest,
  ): Promise<CustomApiResponse<IReward[]>> {
    try {
      const businessId = req.user.userId;
      const rewards = await this.rewardService.getBusinessRewards(businessId);

      return {
        success: true,
        data: rewards,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put(':rewardId')
  @ApiOperation({ summary: 'Actualizar una recompensa' })
  @ApiResponse({
    status: 200,
    description: 'Recompensa actualizada exitosamente',
  })
  async updateReward(
    @Request() req: BusinessRequest,
    @Param('rewardId', ParseIntPipe) rewardId: number,
    @Body()
    updateData: {
      name?: string;
      description?: string;
      requiredStamps?: number;
      stampsCost?: number;
      image?: string;
      expirationDate?: Date;
      stock?: number;
      specialConditions?: string;
      active?: boolean;
      type?: RewardType;
      typeDescription?: string;
    },
  ): Promise<CustomApiResponse<IReward | null>> {
    try {
      const businessId = req.user.userId;
      const reward = await this.rewardService.updateReward(
        businessId,
        rewardId,
        updateData,
      );
      if (!reward) {
        throw new NotFoundException('Recompensa no encontrada');
      }

      return {
        success: true,
        data: reward,
        message: 'Recompensa actualizada exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete(':rewardId')
  @ApiOperation({ summary: 'Eliminar una recompensa' })
  @ApiResponse({
    status: 200,
    description: 'Recompensa eliminada exitosamente',
  })
  async deleteReward(
    @Request() req: BusinessRequest,
    @Param('rewardId', ParseIntPipe) rewardId: number,
  ): Promise<CustomApiResponse<IReward | null>> {
    try {
      const businessId = req.user.userId;
      const reward = await this.rewardService.deleteReward(
        businessId,
        rewardId,
      );
      if (!reward) {
        throw new NotFoundException('Recompensa no encontrada');
      }

      return {
        success: true,
        data: reward,
        message: reward.active
          ? 'Recompensa activada exitosamente'
          : 'Recompensa desactivada exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':rewardId/redeem')
  @ApiOperation({
    summary: 'Canjear una recompensa',
    description:
      'Canjea una recompensa y genera un código único para mostrar al negocio',
  })
  @ApiResponse({
    status: 200,
    description:
      'Recompensa canjeada exitosamente, retorna ticket con código único',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            redemptionCode: {
              type: 'string',
              description: 'Código único de 8 caracteres',
            },
            clientName: { type: 'string' },
            clientEmail: { type: 'string' },
            rewardName: { type: 'string' },
            rewardDescription: { type: 'string' },
            stampsSpent: { type: 'number' },
            redeemedAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['pending', 'delivered', 'expired', 'cancelled'],
            },
            businessName: { type: 'string' },
            businessLogo: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        clientId: { type: 'number', description: 'ID del cliente que canjea' },
      },
    },
  })
  async redeemReward(
    @Request() req,
    @Param('rewardId', ParseIntPipe) rewardId: number,
    @Body() body: { businessId: number },
  ): Promise<CustomApiResponse<IRedemptionTicket>> {
    try {
      const clientId = req.user.userId;
      const redemptionTicket = await this.rewardService.redeemReward(
        body.businessId,
        rewardId,
        clientId,
      );

      return {
        success: true,
        data: redemptionTicket,
        message:
          'Recompensa canjeada exitosamente. Muestra el código al negocio.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('redemptions/dashboard')
  @ApiOperation({
    summary: 'Obtener dashboard de reclamos pendientes',
    description:
      'Dashboard para que el negocio vea reclamos pendientes y recientes entregas',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard de reclamos',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalPending: { type: 'number' },
            totalDelivered: { type: 'number' },
            totalExpired: { type: 'number' },
            pendingRedemptions: { type: 'array' },
            recentDeliveries: { type: 'array' },
          },
        },
      },
    },
  })
  async getRedemptionDashboard(
    @Request() req: AuthenticatedRequest,
  ): Promise<CustomApiResponse<IRedemptionDashboard>> {
    try {
      const businessId = req.user.userId;
      const dashboard =
        await this.rewardService.getRedemptionDashboard(businessId);

      return {
        success: true,
        data: dashboard,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Patch('redemptions/:redemptionId/deliver')
  @ApiOperation({
    summary: 'Marcar recompensa como entregada',
    description:
      'Marca una recompensa como entregada cuando se entrega físicamente al cliente',
  })
  @ApiResponse({
    status: 200,
    description: 'Recompensa marcada como entregada exitosamente',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        deliveredBy: {
          type: 'string',
          description: 'Nombre del empleado que entregó',
        },
        notes: {
          type: 'string',
          description: 'Notas adicionales',
          required: ['false'],
        },
      },
    },
  })
  async deliverRedemption(
    @Request() req,
    @Param('redemptionId', ParseIntPipe) redemptionId: number,
    @Body() body: { employeeId: number; notes?: string },
  ): Promise<CustomApiResponse<any>> {
    try {
      const businessId = req.user.userId;
      const deliveryData: IDeliverRedemptionDto = {
        redemptionId,
        employeeId: body.employeeId,
        notes: body.notes,
      };

      const redemption = await this.rewardService.deliverRedemption(
        businessId,
        deliveryData,
      );

      return {
        success: true,
        data: redemption,
        message: 'Recompensa entregada exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('redemptions/code/:redemptionCode')
  @ApiOperation({
    summary: 'Buscar reclamo por código',
    description: 'Busca un reclamo específico usando el código único',
  })
  @ApiResponse({
    status: 200,
    description: 'Reclamo encontrado',
  })
  async findRedemptionByCode(
    @Request() req,
    @Param('redemptionCode') redemptionCode: string,
  ): Promise<CustomApiResponse<any>> {
    try {
      const businessId = req.user.userId;
      const redemption = await this.rewardService.findRedemptionByCode(
        businessId,
        redemptionCode,
      );

      return {
        success: true,
        data: redemption,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('redemptions/my-history')
  @ApiOperation({
    summary: 'Obtener historial de reclamos del cliente',
    description:
      'Obtiene el historial de recompensas reclamadas por el cliente autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de reclamos del cliente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            redemptions: { type: 'array' },
            total: { type: 'number' },
            page: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RedemptionStatus,
    description: 'Filtrar por estado',
  })
  async getMyRedemptionHistory(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: RedemptionStatus,
  ): Promise<CustomApiResponse<any>> {
    try {
      const clientId = req.user.userId;

      const filters: IRedemptionFilters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        clientId,
      };

      const redemptions = await this.rewardService.getClientRedemptionHistory(
        clientId,
        filters,
      );

      return {
        success: true,
        data: redemptions,
      };
    } catch (error: any) {
      console.log('error', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('redemptions')
  @ApiOperation({
    summary: 'Obtener historial de canjes de recompensas',
    description: 'Obtiene el historial de canjes con filtros opcionales',
  })
  @ApiResponse({ status: 200, description: 'Historial de canjes' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RedemptionStatus,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Fecha desde (ISO string)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Fecha hasta (ISO string)',
  })
  @ApiQuery({
    name: 'clientId',
    required: false,
    description: 'ID del cliente',
  })
  @ApiQuery({
    name: 'rewardId',
    required: false,
    description: 'ID de la recompensa',
  })
  async getRewardRedemptions(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: RedemptionStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('clientId') clientId?: string,
    @Query('rewardId') rewardId?: string,
  ): Promise<CustomApiResponse<any>> {
    try {
      const businessId = req.user.userId;

      const filters: IRedemptionFilters = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        clientId: clientId ? parseInt(clientId) : undefined,
        rewardId: rewardId ? parseInt(rewardId) : undefined,
      };

      const redemptions = await this.rewardService.getRewardRedemptions(
        businessId,
        filters,
      );

      return {
        success: true,
        data: redemptions,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas de recompensas' })
  @ApiResponse({ status: 200, description: 'Estadísticas de recompensas' })
  async getRewardStatistics(@Request() req): Promise<CustomApiResponse<any>> {
    try {
      const businessId = req.user.userId;
      const statistics =
        await this.rewardService.getRewardStatistics(businessId);

      return {
        success: true,
        data: statistics,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Obtener recompensas de un negocio específico' })
  @ApiResponse({ status: 200, description: 'Recompensas del negocio' })
  async getRewardsByBusiness(
    @Param('businessId', ParseIntPipe) businessId: number,
  ): Promise<CustomApiResponse<any>> {
    try {
      const rewards = await this.rewardService.getBusinessRewards(businessId);

      return {
        success: true,
        data: rewards,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('expire-old')
  @ApiOperation({
    summary: 'Expirar códigos vencidos',
    description:
      'Tarea administrativa para expirar códigos de reclamo vencidos',
  })
  @ApiResponse({ status: 200, description: 'Códigos expirados exitosamente' })
  async expireOldRedemptions(): Promise<CustomApiResponse<any>> {
    try {
      await this.rewardService.expireOldRedemptions();

      return {
        success: true,
        message: 'Códigos vencidos expirados exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
