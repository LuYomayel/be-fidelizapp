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
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del cliente',
    example: 'miPassword123',
    minLength: 6,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({
    description: 'Apellido del cliente',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  lastName: string;
}

export class UpdateClientDto implements IUpdateClientDto {
  @ApiPropertyOptional({
    description: 'Email del cliente',
    example: 'cliente@email.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña del cliente',
    minLength: 6,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(6, 100)
  password?: string;

  @ApiPropertyOptional({
    description: 'Nombre del cliente',
    example: 'Juan',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellido del cliente',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;
}

export class LoginClientDto implements ILoginClientDto {
  @ApiProperty({
    description: 'Email del cliente',
    example: 'cliente@email.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del cliente',
    example: 'miPassword123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
