import { IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class LikeLoadDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  load_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  like: number;
}