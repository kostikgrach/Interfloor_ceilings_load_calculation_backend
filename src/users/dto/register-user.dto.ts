import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'alice', description: 'Имя пользователя' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'secret123', description: 'Пароль пользователя' })
  @IsString()
  password: string;
}
