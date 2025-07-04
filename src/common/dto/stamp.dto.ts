import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Length,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateStampDto,
  IRedeemStampDto,
  StampType,
  PurchaseType,
} from '@shared';

export class CreateStampDto implements ICreateStampDto {
  @ApiProperty({
    description: 'Tipo de sello',
    enum: StampType,
    example: StampType.PURCHASE,
  })
  @IsEnum(StampType)
  stampType: StampType;

  @ApiPropertyOptional({
    description: 'Tipo de compra',
    enum: PurchaseType,
    example: PurchaseType.MEDIUM,
  })
  @IsOptional()
  @IsEnum(PurchaseType)
  purchaseType?: PurchaseType;

  @ApiProperty({
    description: 'Valor del sello (cantidad de sellos que otorga)',
    example: 1,
    minimum: 1,
    maximum: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  stampValue: number;

  @ApiProperty({
    description: 'Descripción del sello/compra',
    example: 'Compra de café grande',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  description: string;

  @ApiPropertyOptional({
    description: 'Fecha de expiración del código (opcional)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}

export class RedeemStampDto implements IRedeemStampDto {
  @ApiProperty({
    description: 'Código del sello a canjear',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}

export class QuickStampDto {
  @ApiProperty({
    description: 'Valor de la venta en pesos',
    example: 150,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  saleValue: number;

  @ApiPropertyOptional({
    description: 'Descripción opcional de la venta',
    example: 'Café grande con medialunas',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
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
