import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber
} from 'class-validator';

export class CreateMaintenanceServiceTypeDto
  implements Prisma.MaintenanceServiceTypeCreateManyInput
{
  @ApiProperty({
    description: 'Name of the service type (e.g., "Electrical", "Plumbing").',
    example: 'Electrical',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the service type.',
    example: 'Services related to electrical systems.',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Indicates if the service type is active.',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMaintenanceServiceTypeDto extends PartialType(
  CreateMaintenanceServiceTypeDto
) {
  @ApiProperty({
    description: 'ID of the service type (for upsert operation)',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
