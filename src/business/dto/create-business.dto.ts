import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { BusinessSize, BusinessType } from '@shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Panadería La Delicia' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  businessName: string;

  @ApiProperty({ example: 'contacto@ladelicia.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6, maxLength: 100, example: 'superSecreta123' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiPropertyOptional({ example: '+54 11 1234-5678' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  internalPhone?: string;

  @ApiPropertyOptional({ example: '+54 11 8765-4321' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  externalPhone?: string;

  @ApiProperty({ enum: BusinessSize, example: BusinessSize.SMALL })
  @IsEnum(BusinessSize)
  size: BusinessSize;

  @ApiProperty({ example: 'Av. Siempre Viva 123' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  street?: string;

  @ApiProperty({ example: 'Centro' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  neighborhood?: string;

  @ApiProperty({ example: '1000' })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  postalCode?: string;

  @ApiProperty({ example: 'CABA' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  province?: string;

  @ApiProperty({ enum: BusinessType, example: BusinessType.CAFETERIA })
  @IsEnum(BusinessType)
  type: BusinessType;

  @ApiPropertyOptional({ example: '@negocio' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  instagram?: string;

  @ApiPropertyOptional({ example: '@negocio' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  tiktok?: string;

  @ApiPropertyOptional({ example: 'https://www.negocio.com' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  website?: string;

  @IsOptional()
  logo?: Express.Multer.File;
}
