import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateRoleDto } from '../../roles/dto/roles/role.dto';

// export interface ICreateUserWithRelationsDto
//   extends Prisma.UserCreateManyInput {
//   roles?: Partial<Prisma.RoleCreateManyInput>;
// }

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

export class CreateUserWithRelationsDto extends CreateUserDto {
  @ApiProperty({ description: 'roles', required: false, type: [UpdateRoleDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => UpdateRoleDto) // Transform plain objects to UpdateRoleDto instances
  roles?: UpdateRoleDto[];
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
