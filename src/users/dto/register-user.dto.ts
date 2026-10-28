import { IsString, Length, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  name: string;

  @IsString()
  password: string;
}
