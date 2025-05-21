import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateUserRoleDto {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  userId: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  userRoletypeId: number;
}
