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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { LoginBusinessDto } from './dto/login-business.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('businesses')
@Controller('business')
@UsePipes(new ValidationPipe())
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un negocio' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBusinessDto })
  @ApiResponse({ status: 201, description: 'Negocio registrado exitosamente' })
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
      const logoPath = logo ? logo?.path : undefined;
      const business = await this.businessService.create(
        createBusinessDto,
        logoPath,
      );
      return {
        success: true,
        data: business,
        message: 'Negocio registrado exitosamente',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al registrar el negocio',
      };
    }
  }

  @Post('login')
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

  @Get()
  @UseGuards(JwtAuthGuard)
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
