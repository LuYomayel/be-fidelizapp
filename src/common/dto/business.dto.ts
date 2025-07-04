import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  ICreateBusinessDto,
  IUpdateBusinessDto,
  ILoginBusinessDto,
  BusinessSize,
  BusinessType,
} from '@shared';

export class CreateBusinessDto implements ICreateBusinessDto {
  @ApiProperty({
    description: 'Nombre del negocio',
    example: 'Panadería La Delicia',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  businessName: string;

  @ApiProperty({
    description: 'Email del negocio',
    example: 'contacto@ladelicia.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del negocio',
    example: 'superSecreta123',
    minLength: 6,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiPropertyOptional({
    description: 'Teléfono interno del negocio',
    example: '+54 11 1234-5678',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  internalPhone?: string;

  @ApiPropertyOptional({
    description: 'Teléfono externo del negocio',
    example: '+54 11 8765-4321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  externalPhone?: string;

  @ApiProperty({
    description: 'Tamaño del negocio',
    enum: BusinessSize,
    example: BusinessSize.SMALL,
  })
  @IsEnum(BusinessSize)
  size: BusinessSize;

  @ApiPropertyOptional({
    description: 'Dirección del negocio',
    example: 'Av. Siempre Viva 123',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  street?: string;

  @ApiPropertyOptional({
    description: 'Barrio del negocio',
    example: 'Centro',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  neighborhood?: string;

  @ApiPropertyOptional({
    description: 'Código postal',
    example: '1000',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Provincia',
    example: 'CABA',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  province?: string;

  @ApiProperty({
    description: 'Tipo de negocio',
    enum: BusinessType,
    example: BusinessType.CAFETERIA,
  })
  @IsEnum(BusinessType)
  type: BusinessType;

  @ApiPropertyOptional({
    description: 'Instagram del negocio',
    example: '@negocio',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  instagram?: string;

  @ApiPropertyOptional({
    description: 'TikTok del negocio',
    example: '@negocio',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  tiktok?: string;

  @ApiPropertyOptional({
    description: 'Website del negocio',
    example: 'https://www.negocio.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  website?: string;

  @ApiPropertyOptional({
    description: 'Logo del negocio',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  logo?: Express.Multer.File;
}

export class UpdateBusinessDto
  extends PartialType(CreateBusinessDto)
  implements IUpdateBusinessDto
{
  @ApiPropertyOptional({
    description: 'Nueva contraseña del negocio',
    minLength: 6,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(6, 100)
  password?: string;
}

export class LoginBusinessDto implements ILoginBusinessDto {
  @ApiProperty({
    description: 'Email del negocio',
    example: 'contacto@ladelicia.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del negocio',
    example: 'superSecreta123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
