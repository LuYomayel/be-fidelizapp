import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessDto } from './create-business.dto';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
  @IsOptional()
  @IsString()
  @Length(6, 100)
  password?: string;
}
