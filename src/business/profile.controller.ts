import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';
import {
  IBusinessProfile,
  IUpdateBusinessProfileDto,
  IChangePasswordDto,
  IBusinessQRData,
  IBusinessSettings,
  BusinessRequest,
  ApiResponse as ApiResponseType,
} from '@shared';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { handleMulterError } from '../common/middleware/multer-error.middleware';

@ApiTags('Business Profile')
@Controller('business/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('complete')
  @ApiOperation({ summary: 'Obtener perfil del negocio' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del negocio obtenido exitosamente',
  })
  async getProfile(
    @Req() req: BusinessRequest,
  ): Promise<ApiResponseType<IBusinessProfile>> {
    try {
      const profile = await this.profileService.getBusinessProfile(
        req.user.businessId,
      );
      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener el perfil',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('update')
  @ApiOperation({ summary: 'Actualizar perfil del negocio' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
  })
  async updateProfile(
    @Body() updateProfileDto: IUpdateBusinessProfileDto,
    @Req() req: BusinessRequest,
  ): Promise<ApiResponseType<IBusinessProfile>> {
    try {
      const profile = await this.profileService.updateBusinessProfile(
        req.user.businessId,
        updateProfileDto,
      );
      return {
        success: true,
        data: profile,
        message: 'Perfil actualizado exitosamente',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(
        {
          success: false,
          message: 'Error al actualizar el perfil',
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('logo')
  @ApiOperation({ summary: 'Actualizar logo del negocio' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Logo del negocio',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
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
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Solo se permiten archivos de imagen'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateLogo(
    @UploadedFile() logo: Express.Multer.File,
    @Req() req: BusinessRequest,
  ): Promise<ApiResponseType<IBusinessProfile>> {
    try {
      const profile = await this.profileService.updateBusinessLogo(
        req.user.businessId,
        logo,
      );
      return {
        success: true,
        data: profile,
        message: 'Logo actualizado exitosamente',
      };
    } catch (error) {
      handleMulterError(error);
    }
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Cambiar contraseña del negocio' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña cambiada exitosamente',
  })
  async changePassword(
    @Body() changePasswordDto: IChangePasswordDto,
    @Req() req: BusinessRequest,
  ): Promise<ApiResponseType<void>> {
    try {
      await this.profileService.changeBusinessPassword(
        req.user.businessId,
        changePasswordDto,
      );
      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(
        {
          success: false,
          message: errorMessage || 'Error al cambiar la contraseña',
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('generate-qr')
  @ApiOperation({ summary: 'Generar código QR del negocio' })
  @ApiResponse({
    status: 200,
    description: 'QR generado exitosamente',
  })
  async generateQR(
    @Req() req: BusinessRequest,
  ): Promise<ApiResponseType<IBusinessQRData>> {
    try {
      const qrData = await this.profileService.generateBusinessQR(
        req.user.businessId,
      );
      return {
        success: true,
        data: qrData,
        message: 'QR generado exitosamente',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(
        {
          success: false,
          message: 'Error al generar el QR',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('settings')
  @ApiOperation({ summary: 'Obtener configuraciones del negocio' })
  @ApiResponse({
    status: 200,
    description: 'Configuraciones obtenidas exitosamente',
  })
  async getSettings(
    @Req() req: BusinessRequest,
  ): Promise<ApiResponseType<IBusinessSettings>> {
    try {
      const settings = await this.profileService.getBusinessSettings(
        req.user.businessId,
      );
      return {
        success: true,
        data: settings,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener las configuraciones',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('settings')
  @ApiOperation({ summary: 'Actualizar configuraciones del negocio' })
  @ApiResponse({
    status: 200,
    description: 'Configuraciones actualizadas exitosamente',
  })
  async updateSettings(
    @Body() settings: IBusinessSettings,
    @Req() req: BusinessRequest,
  ): Promise<ApiResponseType<IBusinessSettings>> {
    try {
      const updatedSettings = await this.profileService.updateBusinessSettings(
        req.user.businessId,
        settings,
      );
      return {
        success: true,
        data: updatedSettings,
        message: 'Configuraciones actualizadas exitosamente',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(
        {
          success: false,
          message: 'Error al actualizar las configuraciones',
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
