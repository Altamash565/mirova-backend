import { IsOptional, IsString, Length } from "class-validator";

export class CreateProjectDto {
    @IsString()
    @Length(2, 100)
    name: string;

    @IsString()
    @Length(2, 10)
    key: string;


    @IsOptional()
    @IsOptional()
    description?: string;
}