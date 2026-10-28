import { IsString } from 'class-validator';

export class PublishCurrentDraftDto {
  @IsString()
  description: string;

  @IsString() 
  standard_load: string;

  @IsString()
  reliability_coefficient: string;
}