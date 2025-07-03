import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateClientDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
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
