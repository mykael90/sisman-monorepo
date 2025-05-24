import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

export interface ICreateUserWithRelationsDto
  extends Prisma.UserCreateManyInput {
  roles?: Partial<Prisma.RoleCreateManyInput>;
}

export class CreateUserDto implements Prisma.UserCreateManyInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsOptional()
  isActive?: boolean;
}

export class CreateUserWithRelationsDto
  extends CreateUserDto
  implements ICreateUserWithRelationsDto
{
  @ApiProperty()
  @IsOptional()
  roles?: Partial<Prisma.RoleCreateManyInput>;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id?: number;
}

export class UpdateUserWithRelationsDto extends PartialType(
  CreateUserWithRelationsDto
) {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id?: number;
}
