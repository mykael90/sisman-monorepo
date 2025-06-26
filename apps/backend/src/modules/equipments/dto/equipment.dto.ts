import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  IsDateString,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

export class CreateEquipmentDto implements Prisma.EquipmentCreateManyInput {
  @ApiProperty({
    description: 'Unique patrimony or asset tag number.',
    example: 'PAT-001',
    required: false
  })
  @IsOptional()
  @IsString()
  patrimonyTag?: string;

  @ApiProperty({
    description: 'Name of the equipment.',
    example: 'Air Conditioner',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the equipment.',
    example: 'Split unit, 12000 BTUs, used in office room 301.',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Physical location of the equipment.',
    example: 'Block A, Room 301',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Serial number of the equipment.',
    example: 'SN123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({
    description: 'Manufacturer of the equipment.',
    example: 'LG',
    required: false
  })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({
    description: 'Model of the equipment.',
    example: 'Art Cool',
    required: false
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    description: 'Date when the equipment was acquired (ISO 8601 format).',
    example: '2022-01-15T00:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  acquisitionDate?: string | Date;

  @ApiProperty({
    description: 'Indicates if the equipment is currently active/in use.',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEquipmentDto extends PartialType(CreateEquipmentDto) {
  @ApiProperty({
    description: 'ID of the equipment (for upsert operation)',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
