import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StampConfigService } from './stamp-config.service';
import {
  ICreateStampConfigDto,
  IUpdateStampConfigDto,
  BusinessRequest,
  ApiResponse,
  IStampConfig,
} from '@shared';

@Controller('api/business/stamp-configs')
@UseGuards(JwtAuthGuard)
export class StampConfigController {
  constructor(private readonly stampConfigService: StampConfigService) {}

  @Post()
  async create(
    @Body() createStampConfigDto: ICreateStampConfigDto,
    @Req() req: BusinessRequest,
  ): Promise<ApiResponse<IStampConfig>> {
    try {
      const stampConfig = await this.stampConfigService.create(
        req.user.businessId,
        createStampConfigDto,
      );
      return {
        success: true,
        data: stampConfig,
        message: 'Configuración de sello creada exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al crear la configuración de sello',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Req() req: BusinessRequest,
  ): Promise<ApiResponse<IStampConfig[]>> {
    try {
      const stampConfigs = await this.stampConfigService.findAllByBusiness(
        req.user.businessId,
      );
      return {
        success: true,
        data: stampConfigs,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener las configuraciones de sellos',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('quick-actions')
  async getQuickActions(
    @Req() req: BusinessRequest,
  ): Promise<ApiResponse<IStampConfig[]>> {
    try {
      const quickActions = await this.stampConfigService.getQuickActions(
        req.user.businessId,
      );
      return {
        success: true,
        data: quickActions,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener las acciones rápidas',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: BusinessRequest,
  ): Promise<ApiResponse<IStampConfig>> {
    try {
      const stampConfig = await this.stampConfigService.findOne(
        +id,
        req.user.businessId,
      );
      if (!stampConfig) {
        throw new HttpException(
          {
            success: false,
            message: 'Configuración de sello no encontrada',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: stampConfig,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener la configuración de sello',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStampConfigDto: IUpdateStampConfigDto,
    @Req() req: BusinessRequest,
  ): Promise<ApiResponse<IStampConfig>> {
    try {
      const stampConfig = await this.stampConfigService.update(
        +id,
        req.user.businessId,
        updateStampConfigDto,
      );
      return {
        success: true,
        data: stampConfig,
        message: 'Configuración de sello actualizada exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al actualizar la configuración de sello',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: BusinessRequest,
  ): Promise<ApiResponse<void>> {
    try {
      await this.stampConfigService.remove(+id, req.user.businessId);
      return {
        success: true,
        message: 'Configuración de sello eliminada exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al eliminar la configuración de sello',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/toggle-active')
  async toggleActive(
    @Param('id') id: string,
    @Req() req: BusinessRequest,
  ): Promise<ApiResponse<IStampConfig>> {
    try {
      const stampConfig = await this.stampConfigService.toggleActive(
        +id,
        req.user.businessId,
      );
      return {
        success: true,
        data: stampConfig,
        message: 'Estado de la configuración actualizado exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al cambiar el estado de la configuración',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/toggle-quick-action')
  async toggleQuickAction(
    @Param('id') id: string,
    @Req() req: BusinessRequest,
  ): Promise<ApiResponse<IStampConfig>> {
    try {
      const stampConfig = await this.stampConfigService.toggleQuickAction(
        +id,
        req.user.businessId,
      );
      return {
        success: true,
        data: stampConfig,
        message: 'Acción rápida actualizada exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al cambiar la acción rápida',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
