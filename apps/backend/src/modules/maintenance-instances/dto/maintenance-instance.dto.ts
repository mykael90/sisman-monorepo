import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMaintenanceInstanceDto
  implements Prisma.MaintenanceInstanceCreateManyInput
{
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sipacId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateMaintenanceInstance extends PartialType(
  CreateMaintenanceInstanceDto
) {}
