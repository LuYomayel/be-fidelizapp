import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import {
  CreateClientDto,
  UpdateClientDto,
  LoginClientDto,
} from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('clients')
@Controller('clients')
@UsePipes(new ValidationPipe())
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
      const client = await this.clientsService.create(createClientDto);
      return {
        success: true,
        data: client,
        message: 'Cliente registrado exitosamente',
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

  @Post('login')
  @ApiOperation({ summary: 'Login de cliente' })
  @ApiBody({ type: LoginClientDto })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginClientDto: LoginClientDto) {
    try {
      const client = await this.clientsService.validateClient(
        loginClientDto.email,
        loginClientDto.password,
      );

      if (!client) {
        return {
          success: false,
          data: null,
          message: 'Credenciales inválidas',
        };
      }

      // Generar token JWT
      const token = this.clientsService.generateToken(client);

      return {
        success: true,
        data: {
          client: {
            id: client.id,
            email: client.email,
            firstName: client.firstName,
            lastName: client.lastName,
            provider: client.provider,
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

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida exitosamente',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll() {
    try {
      const clients = await this.clientsService.findAll();
      return { success: true, data: clients };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener los clientes',
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Cliente obtenido exitosamente' })
  @ApiNotFoundResponse({ description: 'Cliente no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const client = await this.clientsService.findOne(id);
      return { success: true, data: client };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
        message: 'Error al obtener el cliente',
      };
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar un cliente' })
  @ApiParam({ name: 'id', description: 'ID del cliente' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Cliente actualizado exitosamente' })
  @ApiNotFoundResponse({ description: 'Cliente no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    try {
      const client = await this.clientsService.update(id, updateClientDto);
      return {
        success: true,
        data: client,
        message: 'Cliente actualizado exitosamente',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        data: null,
        message: 'Error al actualizar el cliente',
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar un cliente' })
  @ApiParam({ name: 'id', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Cliente no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.clientsService.remove(id);
      return { success: true, message: 'Cliente eliminado exitosamente' };
    } catch (error) {
      console.log(error);
      return { success: false, message: 'Error al eliminar el cliente' };
    }
  }
}
