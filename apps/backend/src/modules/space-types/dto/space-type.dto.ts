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

export class CreateSpaceTypeDto implements Prisma.SpaceTypeCreateManyInput {
  @ApiProperty({
    description: 'Name of the space type (e.g., "Classroom", "Laboratory").',
    example: 'Classroom',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the space type.',
    example: 'A room used for teaching and learning activities.',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Icon representing the space type.',
    example: 'fa-solid fa-chalkboard-teacher',
    required: false
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Indicates if the space type is active.',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSpaceTypeDto extends PartialType(CreateSpaceTypeDto) {
  @ApiProperty({
    description: 'ID of the space type (for upsert operation)',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
