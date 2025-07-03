import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { BusinessSize, BusinessType } from '../../../shared';

export class CreateBusinessDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  businessName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  internalPhone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  externalPhone?: string;

  @IsEnum(BusinessSize)
  size: BusinessSize;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  street?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  province?: string;

  @IsEnum(BusinessType)
  type: BusinessType;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  instagram?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  tiktok?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  website?: string;
}
