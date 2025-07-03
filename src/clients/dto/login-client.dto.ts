import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginClientDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
