import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateInfrastructureBuildingDto
  implements Prisma.InfrastructureBuildingCreateManyInput
{
  @IsString()
  @IsNotEmpty()
  id: string;

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

export class UpdateInfrastructureBuildingDto extends PartialType(
  CreateInfrastructureBuildingDto
) {
  @ApiProperty({
    description: 'ID of the building (for upsert operation)',
    example: 'RIP-01',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
