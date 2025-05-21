import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsEnum,
  IsNotEmpty,
  IsDate,
} from 'class-validator';
import { Role } from 'src/shared/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUserDTO {
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
  email: string;

  // @ApiProperty()
  // @IsStrongPassword({
  //   minLength: 6,
  //   minLowercase: 0,
  //   minUppercase: 0,
  //   minNumbers: 0,
  //   minSymbols: 0,
  // })
  // password: string;

  // @ApiProperty({ required: false, type: Date })
  // @IsOptional()
  // @IsDate()
  // @Type(() => Date)
  // birthAt?: Date;

  // @ApiProperty({ required: false, enum: Role })
  // @IsOptional()
  // @IsEnum(Role)
  // role?: Role;
}
