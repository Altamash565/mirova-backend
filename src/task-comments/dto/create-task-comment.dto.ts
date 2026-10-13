import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}
