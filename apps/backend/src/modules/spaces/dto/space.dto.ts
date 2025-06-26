import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSpaceTypeDto } from '../../space-types/dto/space-type.dto';
import { UpdateBuildingDto } from '../../buildings/dto/building.dto';

export class CreateSpaceDto
  implements Omit<Prisma.SpaceCreateManyInput, 'spaceTypeId' | 'buildingId'>
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

export class CreateSpaceWithRelationsDto extends CreateSpaceDto {
  @ApiProperty({
    type: () => UpdateSpaceTypeDto,
    description: 'Type of the space.',
    required: true
  })
  @ValidateNested()
  @Type(() => UpdateSpaceTypeDto)
  spaceType: UpdateSpaceTypeDto;

  @ApiProperty({
    type: () => UpdateBuildingDto,
    description: 'Building where the space is located.',
    required: true
  })
  @ValidateNested()
  @Type(() => UpdateBuildingDto)
  building: UpdateBuildingDto;

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

export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {
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
  CreateSpaceWithRelationsDto
) {}
