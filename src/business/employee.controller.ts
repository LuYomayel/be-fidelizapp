import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  UseGuards,
  ParseIntPipe,
  Put,
  Req,
  Query,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../common/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BusinessRequest } from '@shared';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('employees')
@Controller('employees')
@UsePipes(new ValidationPipe())
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear empleado',
    description: 'Crea un nuevo empleado para el negocio autenticado',
  })
  @ApiBody({
    type: CreateEmployeeDto,
    description: 'Datos del empleado a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Empleado creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req: BusinessRequest,
  ) {
    try {
      const employee = await this.employeeService.create(
        createEmployeeDto,
        req.user.businessId,
      );
      return {
        success: true,
        data: employee,
        message: 'Empleado creado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : 'Error al crear el empleado',
      };
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener empleados',
    description:
      'Obtiene la lista de empleados del negocio con filtros y paginación',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de elementos por página',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Término de búsqueda por nombre o apellido',
  })
  @ApiQuery({
    name: 'isDefault',
    required: false,
    type: Boolean,
    description: 'Filtrar por empleado por defecto',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empleados obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            employees: { type: 'array' },
            total: { type: 'number' },
            page: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findAll(
    @Req() req: BusinessRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isDefault') isDefault?: string,
  ) {
    try {
      const filters = {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        search,
        isDefault: isDefault !== undefined ? isDefault === 'true' : undefined,
      };

      const result = await this.employeeService.findAll(
        req.user.businessId,
        filters,
      );
      return {
        success: true,
        data: result,
        message: 'Empleados obtenidos exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener los empleados',
      };
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener empleado por ID',
    description: 'Obtiene un empleado específico por su ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del empleado',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: BusinessRequest,
  ) {
    try {
      const employee = await this.employeeService.findOne(
        id,
        req.user.businessId,
      );
      return {
        success: true,
        data: employee,
        message: 'Empleado obtenido exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener el empleado',
      };
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar empleado',
    description: 'Actualiza los datos de un empleado específico',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del empleado',
  })
  @ApiBody({
    type: UpdateEmployeeDto,
    description: 'Datos del empleado a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req: BusinessRequest,
  ) {
    try {
      const employee = await this.employeeService.update(
        id,
        updateEmployeeDto,
        req.user.businessId,
      );
      return {
        success: true,
        data: employee,
        message: 'Empleado actualizado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : 'Error al actualizar el empleado',
      };
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar empleado',
    description: 'Elimina un empleado específico',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del empleado',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: BusinessRequest,
  ) {
    try {
      await this.employeeService.remove(id, req.user.businessId);
      return {
        success: true,
        message: 'Empleado eliminado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Error al eliminar el empleado',
      };
    }
  }

  @Get('default/current')
  @ApiOperation({
    summary: 'Obtener empleado por defecto',
    description: 'Obtiene el empleado marcado como por defecto',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado por defecto obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getDefaultEmployee(@Req() req: BusinessRequest) {
    try {
      const employee = await this.employeeService.getDefaultEmployee(
        req.user.businessId,
      );
      return {
        success: true,
        data: employee,
        message: employee
          ? 'Empleado por defecto obtenido exitosamente'
          : 'No hay empleado por defecto configurado',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : 'Error al obtener el empleado por defecto',
      };
    }
  }

  @Post(':id/set-default')
  @ApiOperation({
    summary: 'Establecer empleado por defecto',
    description: 'Marca un empleado como empleado por defecto',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del empleado',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado establecido como por defecto exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async setDefaultEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: BusinessRequest,
  ) {
    try {
      const employee = await this.employeeService.setDefaultEmployee(
        id,
        req.user.businessId,
      );
      return {
        success: true,
        data: employee,
        message: 'Empleado establecido como por defecto exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : 'Error al establecer el empleado por defecto',
      };
    }
  }
}
