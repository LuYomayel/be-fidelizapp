import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginBusinessDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
