import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateTaskCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}
