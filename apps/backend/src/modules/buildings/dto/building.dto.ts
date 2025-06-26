import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateBuildingDto implements Prisma.BuildingCreateManyInput {
  @ApiProperty({
    description: 'Name of the building.',
    example: 'Bloco A',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Code of the building (e.g., "A", "B").',
    example: 'A',
    required: false
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Address of the building.',
    example: 'Rua Exemplo, 123',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateBuildingDto extends PartialType(CreateBuildingDto) {
  @ApiProperty({
    description: 'ID of the building (for upsert operation)',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
