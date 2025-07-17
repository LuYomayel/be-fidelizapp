import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateClientDto, IUpdateClientDto, ILoginClientDto } from '@shared';

export class CreateClientDto implements ICreateClientDto {
  @ApiProperty({
    description: 'Email del cliente',
    example: 'cliente@email.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Por favor ingrese un email válido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del cliente',
    example: 'miPassword123',
    minLength: 6,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @Length(6, 100, {
    message: 'La contraseña debe tener entre 6 y 100 caracteres',
  })
  password: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del cliente',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @Length(1, 100, {
    message: 'El apellido debe tener entre 1 y 100 caracteres',
  })
  lastName: string;
}

export class UpdateClientDto implements IUpdateClientDto {
  @ApiPropertyOptional({
    description: 'Email del cliente',
    example: 'cliente@email.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Por favor ingrese un email válido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña del cliente',
    minLength: 6,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @Length(6, 100, {
    message: 'La contraseña debe tener entre 6 y 100 caracteres',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Nombre del cliente',
    example: 'Juan',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellido del cliente',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @Length(1, 100, {
    message: 'El apellido debe tener entre 1 y 100 caracteres',
  })
  lastName?: string;
}

export class LoginClientDto implements ILoginClientDto {
  @ApiProperty({
    description: 'Email del cliente',
    example: 'cliente@email.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Por favor ingrese un email válido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del cliente',
    example: 'miPassword123',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;
}
