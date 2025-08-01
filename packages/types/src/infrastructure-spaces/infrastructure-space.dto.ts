import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateInfrastructureSpaceTypeDto } from '../infrastructure-space-types/infrastructure-space-type.dto';
import { UpdateInfrastructureBuildingDto } from '../infrastructure-buildings/infrastructure-building.dto';

export class CreateInfrastructureSpaceDto
  implements
    Omit<
      Prisma.InfrastructureSpaceCreateManyInput,
      'spaceTypeId' | 'buildingId'
    >
{
  @ApiProperty({
    description: 'Name of the space.',
    example: 'Room 101',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Floor where the space is located.',
    example: '1st Floor',
    required: false
  })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({
    description: 'Description of the space.',
    example: 'A classroom used for lectures and presentations.',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID of the parent space, if this is a nested space.',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;
}

export class CreateInfrastructureSpaceWithRelationsDto extends CreateInfrastructureSpaceDto {
  @ApiProperty({
    type: () => UpdateInfrastructureSpaceTypeDto,
    description: 'Type of the space.',
    required: true
  })
  @ValidateNested()
  @Type(() => UpdateInfrastructureSpaceTypeDto)
  spaceType: UpdateInfrastructureSpaceTypeDto;

  @ApiProperty({
    type: () => UpdateInfrastructureBuildingDto,
    description: 'Building where the space is located.',
    required: true
  })
  @ValidateNested()
  @Type(() => UpdateInfrastructureBuildingDto)
  building: UpdateInfrastructureBuildingDto;

  // TODO: nesses casos de recursão, faz como?
  // @ApiProperty({
  //   type: () => UpdateSpaceDto,
  //   description: 'Parent space, if this is a nested space.',
  //   required: false
  // })
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => UpdateSpaceDto)
  // parent?: UpdateSpaceDto;
}

export class UpdateInfrastructureSpaceDto extends PartialType(
  CreateInfrastructureSpaceDto
) {
  @ApiProperty({
    description: 'ID of the space (for upsert operation)',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdateSpaceWithRelationsDto extends PartialType(
  CreateInfrastructureSpaceWithRelationsDto
) {}
