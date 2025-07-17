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
  @IsNotEmpty({ message: 'El nombre del negocio es obligatorio' })
  @IsString({ message: 'El nombre del negocio debe ser una cadena de texto' })
  @Length(1, 255, {
    message: 'El nombre del negocio debe tener entre 1 y 255 caracteres',
  })
  businessName: string;

  @ApiProperty({
    description: 'Email del negocio',
    example: 'contacto@ladelicia.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Por favor ingrese un email válido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del negocio',
    example: 'superSecreta123',
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
    description: 'Nombre del administrador del negocio',
    example: 'Juan',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre del administrador es obligatorio' })
  @IsString({
    message: 'El nombre del administrador debe ser una cadena de texto',
  })
  @Length(1, 100, {
    message: 'El nombre del administrador debe tener entre 1 y 100 caracteres',
  })
  adminFirstName: string;

  @ApiProperty({
    description: 'Apellido del administrador del negocio',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El apellido del administrador es obligatorio' })
  @IsString({
    message: 'El apellido del administrador debe ser una cadena de texto',
  })
  @Length(1, 100, {
    message:
      'El apellido del administrador debe tener entre 1 y 100 caracteres',
  })
  adminLastName: string;

  @ApiPropertyOptional({
    description: 'Teléfono interno del negocio',
    example: '+54 11 1234-5678',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono interno debe ser una cadena de texto' })
  @Length(1, 20, {
    message: 'El teléfono interno debe tener entre 1 y 20 caracteres',
  })
  internalPhone?: string;

  @ApiPropertyOptional({
    description: 'Teléfono externo del negocio',
    example: '+54 11 8765-4321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono externo debe ser una cadena de texto' })
  @Length(1, 20, {
    message: 'El teléfono externo debe tener entre 1 y 20 caracteres',
  })
  externalPhone?: string;

  @ApiProperty({
    description: 'Tamaño del negocio',
    enum: BusinessSize,
    example: BusinessSize.SMALL,
  })
  @IsEnum(BusinessSize, {
    message: 'El tamaño del negocio debe ser uno de los valores permitidos',
  })
  size: BusinessSize;

  @ApiPropertyOptional({
    description: 'Dirección del negocio',
    example: 'Av. Siempre Viva 123',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @Length(1, 255, {
    message: 'La dirección debe tener entre 1 y 255 caracteres',
  })
  street?: string;

  @ApiPropertyOptional({
    description: 'Barrio del negocio',
    example: 'Centro',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El barrio debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El barrio debe tener entre 1 y 100 caracteres' })
  neighborhood?: string;

  @ApiPropertyOptional({
    description: 'Código postal',
    example: '1000',
    maxLength: 10,
  })
  @IsOptional()
  @IsString({ message: 'El código postal debe ser una cadena de texto' })
  @Length(1, 10, {
    message: 'El código postal debe tener entre 1 y 10 caracteres',
  })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Provincia',
    example: 'CABA',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La provincia debe ser una cadena de texto' })
  @Length(1, 100, {
    message: 'La provincia debe tener entre 1 y 100 caracteres',
  })
  province?: string;

  @ApiProperty({
    description: 'Tipo de negocio',
    enum: BusinessType,
    example: BusinessType.CAFETERIA,
  })
  @IsEnum(BusinessType, {
    message: 'El tipo de negocio debe ser uno de los valores permitidos',
  })
  type: BusinessType;

  @ApiPropertyOptional({
    description: 'Tipo de negocio personalizado',
    example: 'Cafetería',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El tipo personalizado debe ser una cadena de texto' })
  @Length(1, 255, {
    message: 'El tipo personalizado debe tener entre 1 y 255 caracteres',
  })
  customType?: string;

  @ApiPropertyOptional({
    description: 'Instagram del negocio',
    example: '@negocio',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El Instagram debe ser una cadena de texto' })
  @Length(1, 255, {
    message: 'El Instagram debe tener entre 1 y 255 caracteres',
  })
  instagram?: string;

  @ApiPropertyOptional({
    description: 'TikTok del negocio',
    example: '@negocio',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El TikTok debe ser una cadena de texto' })
  @Length(1, 255, { message: 'El TikTok debe tener entre 1 y 255 caracteres' })
  tiktok?: string;

  @ApiPropertyOptional({
    description: 'Website del negocio',
    example: 'https://www.negocio.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El website debe ser una cadena de texto' })
  @Length(1, 255, { message: 'El website debe tener entre 1 y 255 caracteres' })
  website?: string;

  @ApiPropertyOptional({
    description: 'Logo del negocio',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  logo?: File;
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
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @Length(6, 100, {
    message: 'La contraseña debe tener entre 6 y 100 caracteres',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Nombre del administrador del negocio',
    example: 'Juan',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({
    message: 'El nombre del administrador debe ser una cadena de texto',
  })
  @Length(1, 100, {
    message: 'El nombre del administrador debe tener entre 1 y 100 caracteres',
  })
  adminFirstName?: string;

  @ApiPropertyOptional({
    description: 'Apellido del administrador del negocio',
    example: 'Pérez',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({
    message: 'El apellido del administrador debe ser una cadena de texto',
  })
  @Length(1, 100, {
    message:
      'El apellido del administrador debe tener entre 1 y 100 caracteres',
  })
  adminLastName?: string;
}

export class LoginBusinessDto implements ILoginBusinessDto {
  @ApiProperty({
    description: 'Email del negocio',
    example: 'contacto@ladelicia.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Por favor ingrese un email válido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del negocio',
    example: 'superSecreta123',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email del negocio',
    example: 'contacto@ladelicia.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Por favor ingrese un email válido' })
  email: string;

  @ApiProperty({
    description: 'Código de verificación',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty({ message: 'El código de verificación es obligatorio' })
  @IsString({
    message: 'El código de verificación debe ser una cadena de texto',
  })
  @Length(6, 6, {
    message: 'El código de verificación debe tener exactamente 6 caracteres',
  })
  verificationCode: string;
}

export class ResendVerificationCodeDto {
  @ApiProperty({
    description: 'Email del negocio',
    example: 'contacto@ladelicia.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Por favor ingrese un email válido' })
  email: string;
}
