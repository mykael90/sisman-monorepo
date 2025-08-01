import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateInfrastructureBuildingDto } from '../infrastructure-buildings/infrastructure-building.dto';

export class CreateInfrastructureSystemDto
  implements Prisma.InfrastructureSystemCreateManyInput
{
  @ApiProperty({
    description:
      'Name of the infrastructure system (e.g., "HVAC", "Electrical").',
    example: 'HVAC System',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of the infrastructure system.',
    example: 'Mechanical',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Description of the infrastructure system.',
    example:
      'System responsible for heating, ventilation, and air conditioning.',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateInfrastructureSystemWithRelationsDto extends CreateInfrastructureSystemDto {
  @ApiProperty({
    type: () => [UpdateInfrastructureBuildingDto],
    description: 'Buildings associated with this infrastructure system.',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInfrastructureBuildingDto)
  buildings?: UpdateInfrastructureBuildingDto[];
}

export class UpdateInfrastructureSystemDto extends PartialType(
  CreateInfrastructureSystemDto
) {
  @ApiProperty({
    description: 'ID of the infrastructure system (for upsert operation)',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdateInfrastructureSystemWithRelationsDto extends PartialType(
  CreateInfrastructureSystemWithRelationsDto
) {}
