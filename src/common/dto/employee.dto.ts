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
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({
    description: 'Apellido del empleado',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Indica si es el empleado por defecto',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
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
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellido del empleado',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Indica si es el empleado por defecto',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
