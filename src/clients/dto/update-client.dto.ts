import { IsEmail, IsString } from 'class-validator';
import { IsNotEmpty, Length } from 'class-validator';

export class UpdateClientDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  password: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  lastName: string;
}
