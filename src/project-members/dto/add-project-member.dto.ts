import { IsEmail, IsOptional, IsString } from 'class-validator';

export class AddProjectMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  role?: string;
}
