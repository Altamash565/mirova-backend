import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
