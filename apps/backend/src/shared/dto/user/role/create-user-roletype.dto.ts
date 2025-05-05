import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserRoletypeDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
