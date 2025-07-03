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
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { LoginClientDto } from './dto/login-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clients')
@UsePipes(new ValidationPipe())
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('register')
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
        message: error.message || 'Error al registrar el cliente',
      };
    }
  }

  @Post('login')
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
