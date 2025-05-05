import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMaterialDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  specification?: string | null;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean | null;
}
