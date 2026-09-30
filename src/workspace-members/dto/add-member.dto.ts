import { IsEmail, IsIn } from 'class-validator';

export class AddMemberDto {
  @IsEmail()
  email: string;

  @IsIn(['ADMIN', 'MEMBER'])
  role: 'ADMIN' | 'MEMBER' = 'MEMBER';
}
