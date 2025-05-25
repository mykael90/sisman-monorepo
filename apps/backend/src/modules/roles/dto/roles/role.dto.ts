import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRoleDto implements Prisma.RoleCreateManyInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
