import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../common/dto';
import { IEmployee, IEmployeeFilters } from '@shared';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async create(
    createEmployeeDto: CreateEmployeeDto,
    businessId: number,
  ): Promise<IEmployee> {
    // Si se está marcando como empleado por defecto, desmarcar el anterior
    if (createEmployeeDto.isDefault) {
      await this.clearDefaultEmployee(businessId);
    }

    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      businessId,
    });

    return await this.employeeRepository.save(employee);
  }

  async findAll(
    businessId: number,
    filters?: IEmployeeFilters,
  ): Promise<{
    employees: IEmployee[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      // Construir query base
      const queryBuilder = this.employeeRepository
        .createQueryBuilder('employee')
        .where('employee.businessId = :businessId', { businessId });

      // Aplicar filtros
      if (filters?.search) {
        queryBuilder.andWhere(
          '(employee.firstName LIKE :search OR employee.lastName LIKE :search)',
          { search: `%${filters.search}%` },
        );
      }

      if (filters?.isDefault !== undefined) {
        queryBuilder.andWhere('employee.isDefault = :isDefault', {
          isDefault: filters.isDefault,
        });
      }

      // Contar total
      const total = await queryBuilder.getCount();

      // Obtener resultados paginados
      const employees = await queryBuilder
        .orderBy('employee.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();

      const totalPages = Math.ceil(total / limit);

      return {
        employees,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error al obtener los empleados:', error);
      throw error;
    }
  }

  async findOne(id: number, businessId: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id, businessId },
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return employee;
  }

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
    businessId: number,
  ): Promise<IEmployee> {
    const employee = await this.findOne(id, businessId);

    // Si se está marcando como empleado por defecto, desmarcar el anterior
    if (updateEmployeeDto.isDefault) {
      await this.clearDefaultEmployee(businessId);
    }

    // Si se está desmarcando como empleado por defecto, verificar que no sea el único
    if (updateEmployeeDto.isDefault === false && employee.isDefault) {
      const totalEmployees = await this.employeeRepository.count({
        where: { businessId },
      });
      if (totalEmployees <= 1) {
        throw new BadRequestException(
          'No se puede desmarcar el empleado por defecto si es el único empleado',
        );
      }
    }

    Object.assign(employee, updateEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  async remove(id: number, businessId: number): Promise<void> {
    const employee = await this.findOne(id, businessId);

    // Verificar que no sea el único empleado
    const totalEmployees = await this.employeeRepository.count({
      where: { businessId },
    });

    if (totalEmployees <= 1) {
      throw new BadRequestException(
        'No se puede eliminar el único empleado del negocio',
      );
    }

    await this.employeeRepository.remove(employee);
  }

  async getDefaultEmployee(businessId: number): Promise<IEmployee | null> {
    return await this.employeeRepository.findOne({
      where: { businessId, isDefault: true },
    });
  }

  async setDefaultEmployee(id: number, businessId: number): Promise<IEmployee> {
    const employee = await this.findOne(id, businessId);

    // Desmarcar el empleado por defecto actual
    await this.clearDefaultEmployee(businessId);

    // Marcar el nuevo empleado por defecto
    employee.isDefault = true;
    return await this.employeeRepository.save(employee);
  }

  private async clearDefaultEmployee(businessId: number): Promise<void> {
    await this.employeeRepository.update(
      { businessId, isDefault: true },
      { isDefault: false },
    );
  }

  async getEmployeeCount(businessId: number): Promise<number> {
    return await this.employeeRepository.count({
      where: { businessId },
    });
  }

  async findByName(
    firstName: string,
    lastName: string,
    businessId: number,
  ): Promise<IEmployee | null> {
    return await this.employeeRepository.findOne({
      where: {
        firstName: Like(firstName),
        lastName: Like(lastName),
        businessId,
      },
    });
  }
}
