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
  BadRequestException,
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
import { ClientProfileService } from './client-profile.service';
import {
  IClientProfile,
  IUpdateClientProfileDto,
  IChangePasswordDto,
  IClientSettings,
  ClientRequest,
  ApiResponse as ApiResponseType,
} from '@shared';

@ApiTags('Client Profile')
@Controller('clients/profile')
@UseGuards(JwtAuthGuard)
export class ClientProfileController {
  constructor(private readonly profileService: ClientProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener perfil básico del cliente' })
  @ApiResponse({
    status: 200,
    description: 'Perfil básico del cliente obtenido exitosamente',
  })
  async getProfile(
    @Req() req: ClientRequest,
  ): Promise<ApiResponseType<IClientProfile>> {
    try {
      const profile = await this.profileService.getClientProfile(
        req.user.userId,
      );
      return {
        success: true,
        data: profile,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener el perfil',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('complete')
  @ApiOperation({
    summary: 'Obtener perfil completo del cliente con estadísticas',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil completo del cliente obtenido exitosamente',
  })
  async getCompleteProfile(
    @Req() req: ClientRequest,
  ): Promise<ApiResponseType<IClientProfile>> {
    try {
      const profile = await this.profileService.getClientProfile(
        req.user.userId,
      );
      return {
        success: true,
        data: profile,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener el perfil completo',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar perfil del cliente' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
  })
  async updateProfile(
    @Body() updateProfileDto: IUpdateClientProfileDto,
    @Req() req: ClientRequest,
  ): Promise<ApiResponseType<IClientProfile>> {
    try {
      const profile = await this.profileService.updateClientProfile(
        req.user.userId,
        updateProfileDto,
      );
      return {
        success: true,
        data: profile,
        message: 'Perfil actualizado exitosamente',
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al actualizar el perfil',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('profile-picture')
  @ApiOperation({ summary: 'Actualizar foto de perfil del cliente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Foto de perfil del cliente',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        profilePicture: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @UploadedFile() profilePicture: Express.Multer.File,
    @Req() req: ClientRequest,
  ): Promise<ApiResponseType<IClientProfile>> {
    try {
      const profile = await this.profileService.updateClientProfilePicture(
        req.user.userId,
        profilePicture,
      );
      return {
        success: true,
        data: profile,
        message: 'Foto de perfil actualizada exitosamente',
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al actualizar la foto de perfil',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Cambiar contraseña del cliente' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña cambiada exitosamente',
  })
  async changePassword(
    @Body() changePasswordDto: IChangePasswordDto,
    @Req() req: ClientRequest,
  ): Promise<ApiResponseType<void>> {
    try {
      console.log('changePasswordDto', changePasswordDto);
      await this.profileService.changeClientPassword(
        req.user.userId,
        changePasswordDto,
      );
      return {
        success: true,
        message: 'Contraseña cambiada exitosamente',
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error al cambiar la contraseña',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('reset-password-without-current')
  @ApiOperation({
    summary:
      'Restablecer contraseña sin validar la actual (solo para casos especiales)',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente',
  })
  async resetPasswordWithoutCurrent(
    @Body() body: { newPassword: string; confirmPassword: string },
    @Req() req: ClientRequest,
  ): Promise<ApiResponseType<void>> {
    try {
      if (body.newPassword !== body.confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      await this.profileService.resetPasswordWithoutCurrent(
        req.user.userId,
        body.newPassword,
      );
      return {
        success: true,
        message: 'Contraseña restablecida exitosamente',
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Error al restablecer la contraseña',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('settings')
  @ApiOperation({ summary: 'Obtener configuraciones del cliente' })
  @ApiResponse({
    status: 200,
    description: 'Configuraciones obtenidas exitosamente',
  })
  async getSettings(
    @Req() req: ClientRequest,
  ): Promise<ApiResponseType<IClientSettings>> {
    try {
      const settings = await this.profileService.getClientSettings(
        req.user.userId,
      );
      return {
        success: true,
        data: settings,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener las configuraciones',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('settings')
  @ApiOperation({ summary: 'Actualizar configuraciones del cliente' })
  @ApiResponse({
    status: 200,
    description: 'Configuraciones actualizadas exitosamente',
  })
  async updateSettings(
    @Body() settings: IClientSettings,
    @Req() req: ClientRequest,
  ): Promise<ApiResponseType<IClientSettings>> {
    try {
      const updatedSettings = await this.profileService.updateClientSettings(
        req.user.userId,
        settings,
      );
      return {
        success: true,
        data: updatedSettings,
        message: 'Configuraciones actualizadas exitosamente',
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al actualizar las configuraciones',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas del cliente' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async getStatistics(
    @Req() req: ClientRequest,
  ): Promise<ApiResponseType<any>> {
    try {
      const statistics = await this.profileService.getClientStatistics(
        req.user.userId,
      );
      return {
        success: true,
        data: statistics,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener las estadísticas',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
