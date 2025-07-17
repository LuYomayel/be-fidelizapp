import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { ICreateEmployeeDto, IUpdateEmployeeDto } from '@shared';

export class CreateEmployeeDto implements ICreateEmployeeDto {
  @ApiProperty({
    description: 'Nombre del empleado',
    example: 'Juan',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre del empleado es obligatorio' })
  @IsString({ message: 'El nombre del empleado debe ser una cadena de texto' })
  @Length(1, 100, {
    message: 'El nombre del empleado debe tener entre 1 y 100 caracteres',
  })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del empleado',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El apellido del empleado es obligatorio' })
  @IsString({
    message: 'El apellido del empleado debe ser una cadena de texto',
  })
  @Length(1, 100, {
    message: 'El apellido del empleado debe tener entre 1 y 100 caracteres',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Indica si es el empleado por defecto',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El campo "es empleado por defecto" debe ser verdadero o falso',
  })
  isDefault?: boolean;
}

export class UpdateEmployeeDto
  extends PartialType(CreateEmployeeDto)
  implements IUpdateEmployeeDto
{
  @ApiPropertyOptional({
    description: 'Nombre del empleado',
    example: 'Juan',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El nombre del empleado debe ser una cadena de texto' })
  @Length(1, 100, {
    message: 'El nombre del empleado debe tener entre 1 y 100 caracteres',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellido del empleado',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({
    message: 'El apellido del empleado debe ser una cadena de texto',
  })
  @Length(1, 100, {
    message: 'El apellido del empleado debe tener entre 1 y 100 caracteres',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Indica si es el empleado por defecto',
    example: false,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El campo "es empleado por defecto" debe ser verdadero o falso',
  })
  isDefault?: boolean;
}
