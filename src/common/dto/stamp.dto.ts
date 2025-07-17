import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsDate,
  Length,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateStampDto,
  IRedeemStampDto,
  StampType,
  PurchaseType,
  RedemptionStatus,
} from '@shared';

export class CreateStampDto implements ICreateStampDto {
  @ApiProperty({
    description: 'Tipo de sello',
    enum: StampType,
    example: StampType.PURCHASE,
  })
  @IsEnum(StampType, {
    message: 'El tipo de sello debe ser uno de los valores permitidos',
  })
  stampType: StampType;

  @ApiPropertyOptional({
    description: 'Tipo de compra',
    enum: PurchaseType,
    example: PurchaseType.MEDIUM,
  })
  @IsOptional()
  @IsEnum(PurchaseType, {
    message: 'El tipo de compra debe ser uno de los valores permitidos',
  })
  purchaseType?: PurchaseType;

  @ApiProperty({
    description: 'Valor del sello (cantidad de sellos que otorga)',
    example: 1,
    minimum: 1,
    maximum: 10,
  })
  @IsNumber({}, { message: 'El valor del sello debe ser un número' })
  @Min(1, { message: 'El valor del sello debe ser mínimo 1' })
  @Max(10, { message: 'El valor del sello no puede ser mayor a 10' })
  stampValue: number;

  @ApiProperty({
    description: 'Descripción del sello/compra',
    example: 'Compra de café grande',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(1, 500, {
    message: 'La descripción debe tener entre 1 y 500 caracteres',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Fecha de expiración del código (opcional)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de expiración debe ser una fecha válida' },
  )
  expiresAt?: Date;
}

export class RedeemStampDto implements IRedeemStampDto {
  @ApiProperty({
    description: 'Código del sello a canjear',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty({ message: 'El código del sello es obligatorio' })
  @IsString({ message: 'El código del sello debe ser una cadena de texto' })
  @Length(6, 6, {
    message: 'El código del sello debe tener exactamente 6 caracteres',
  })
  code: string;
}

export class QuickStampDto {
  @ApiProperty({
    description: 'Valor de la venta en pesos',
    example: 150,
    minimum: 1,
  })
  @IsNumber({}, { message: 'El valor de la venta debe ser un número' })
  @Min(1, { message: 'El valor de la venta debe ser mínimo 1 peso' })
  saleValue: number;

  @ApiPropertyOptional({
    description: 'Descripción opcional de la venta',
    example: 'Café grande con medialunas',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(1, 500, {
    message: 'La descripción debe tener entre 1 y 500 caracteres',
  })
  description?: string;
}

export class StampResponseDto {
  @ApiProperty({ description: 'ID del sello' })
  id: number;

  @ApiProperty({ description: 'Código único del sello', example: '123456' })
  code: string;

  @ApiPropertyOptional({ description: 'Código QR en base64' })
  qrCode?: string;

  @ApiProperty({ description: 'Tipo de sello', enum: StampType })
  stampType: StampType;

  @ApiPropertyOptional({ description: 'Tipo de compra', enum: PurchaseType })
  purchaseType?: PurchaseType;

  @ApiProperty({ description: 'Valor del sello' })
  stampValue: number;

  @ApiProperty({ description: 'Descripción del sello' })
  description: string;

  @ApiProperty({ description: 'Estado del sello' })
  status: string;

  @ApiPropertyOptional({ description: 'Fecha de expiración' })
  expiresAt?: Date;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Información del negocio' })
  business: {
    id: number;
    businessName: string;
    logoPath?: string;
    type: string;
  };
}

export class ClientCardResponseDto {
  @ApiProperty({ description: 'ID de la tarjeta' })
  id: number;

  @ApiProperty({ description: 'Total de sellos acumulados' })
  totalStamps: number;

  @ApiProperty({ description: 'Sellos disponibles' })
  availableStamps: number;

  @ApiProperty({ description: 'Sellos usados' })
  usedStamps: number;

  @ApiProperty({ description: 'Nivel actual' })
  level: number;

  @ApiPropertyOptional({ description: 'Fecha del último sello' })
  lastStampDate?: Date;

  @ApiProperty({ description: 'Información del negocio' })
  business: {
    id: number;
    businessName: string;
    logoPath?: string;
    type: string;
    stampsForReward: number;
    rewardDescription?: string;
  };
}

export class ClientCardWithRewardDto extends ClientCardResponseDto {
  @ApiPropertyOptional({
    description: 'Recompensa más cercana a canjear',
    example: {
      id: 1,
      name: 'Café gratis',
      stampsCost: 5,
      description: 'Café de cualquier tamaño gratis',
    },
  })
  nearestReward?: {
    id: number;
    name: string;
    stampsCost: number;
    description: string;
  };

  @ApiProperty({
    description: 'Objetivo de sellos para la próxima recompensa',
    example: 5,
  })
  progressTarget: number;
}

export class RedeemStampResponseDto {
  @ApiProperty({ description: 'Mensaje de éxito' })
  message: string;

  @ApiProperty({ description: 'Información del sello canjeado' })
  stamp: StampResponseDto;

  @ApiProperty({ description: 'Tarjeta actualizada del cliente' })
  clientCard: ClientCardResponseDto;

  @ApiProperty({ description: 'Sellos ganados' })
  stampsEarned: number;
}

export class RedemptionFiltersDto {
  @ApiPropertyOptional({
    description: 'Estado de la redención',
    enum: RedemptionStatus,
  })
  @IsOptional()
  @IsEnum(RedemptionStatus, {
    message: 'El estado de la redención debe ser uno de los valores permitidos',
  })
  status?: RedemptionStatus;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para filtrar',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  dateFrom?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de fin para filtrar',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  dateTo?: Date;

  @ApiPropertyOptional({
    description: 'ID del cliente',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber({}, { message: 'El ID del cliente debe ser un número' })
  clientId?: number;

  @ApiPropertyOptional({
    description: 'ID de la recompensa',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber({}, { message: 'El ID de la recompensa debe ser un número' })
  rewardId?: number;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber({}, { message: 'El número de página debe ser un número' })
  @Min(1, { message: 'El número de página debe ser mínimo 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Límite de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber({}, { message: 'El límite de elementos debe ser un número' })
  @Min(1, { message: 'El límite de elementos debe ser mínimo 1' })
  @Max(100, { message: 'El límite de elementos no puede ser mayor a 100' })
  limit?: number;
}
