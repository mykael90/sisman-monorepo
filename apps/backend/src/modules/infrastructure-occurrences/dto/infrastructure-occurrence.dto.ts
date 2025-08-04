import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Prisma } from '@sisman/prisma';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserDto } from '../../users/dto/user.dto'; // Assuming User DTO exists
import { UpdateInfrastructureBuildingDto } from '../../infrastructure-buildings/dto/infrastructure-building.dto';
import { UpdateInfrastructureSpaceDto } from '../../infrastructure-spaces/dto/infrastructure-space.dto';
import { UpdateInfrastructureOccurrenceDiagnosisDto } from '../../infrastructure-occurrence-diagnosis/dto/infrastructure-occurrence-diagnosis.dto';
import { UpdateInfrastructureOccurrenceReinforcementDto } from '../../infrastructure-occurrence-reinforcements/dto/infrastructure-occurrence-reinforcement.dto';

export class CreateInfrastructureOccurrenceDto
  implements
    Omit<
      Prisma.InfrastructureOccurrenceCreateManyInput,
      'reportedById' | 'spaceId' | 'buildingId' | 'duplicateOfId'
    >
{
  @ApiProperty({
    description: 'A brief title for the occurrence.',
    example: 'Broken light in hallway',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the observed problem.',
    example:
      'The fluorescent light in the main hallway of Block C is flickering and sometimes turns off completely.',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description:
      'Textual description of the location (e.g., "Corridor of Block B, near room 203").',
    example: 'Block C, Main Hallway',
    required: false
  })
  @IsOptional()
  @IsString()
  locationDescription?: string;

  @ApiProperty({
    description:
      'The date and time when the occurrence was reported (ISO 8601 format).',
    example: '2023-10-27T09:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  reportedAt?: string | Date;

  @ApiProperty({
    description: 'The current status of the occurrence.',
    enum: $Enums.InfrastructureOccurrenceStatus,
    example: $Enums.InfrastructureOccurrenceStatus.REPORTED,
    required: false
  })
  @IsOptional()
  @IsEnum($Enums.InfrastructureOccurrenceStatus)
  status?: $Enums.InfrastructureOccurrenceStatus;

  @ApiProperty({
    description:
      'Notes on how the occurrence was resolved, if without a formal Maintenance Request.',
    example: 'Replaced the light bulb, issue resolved.',
    required: false
  })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @ApiProperty({
    description: 'ID of a duplicate occurrence, if this is a duplicate.',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  duplicateOfId?: number;

  @ApiProperty({
    description: 'ID of the space related to this occurrence.',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  spaceId?: number;

  @ApiProperty({
    description: 'ID of the building related to this occurrence.',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  buildingId?: number;
}

export class CreateInfrastructureOccurrenceWithRelationsDto extends CreateInfrastructureOccurrenceDto {
  @ApiProperty({
    type: () => UpdateUserDto,
    description: 'User who reported the occurrence.',
    required: true
  })
  @IsNotEmpty()
  @Type(() => UpdateUserDto)
  reportedBy: UpdateUserDto;

  @ApiProperty({
    type: () => UpdateInfrastructureSpaceDto,
    description: 'The space where the occurrence happened.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureSpaceDto)
  space?: UpdateInfrastructureSpaceDto;

  @ApiProperty({
    type: () => UpdateInfrastructureBuildingDto,
    description: 'The building where the occurrence happened.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureBuildingDto)
  building?: UpdateInfrastructureBuildingDto;

  @ApiProperty({
    type: () => UpdateInfrastructureOccurrenceDiagnosisDto,
    description: 'The diagnosis associated with this occurrence.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInfrastructureOccurrenceDiagnosisDto)
  diagnosis?: UpdateInfrastructureOccurrenceDiagnosisDto;

  @ApiProperty({
    type: () => [UpdateInfrastructureOccurrenceReinforcementDto],
    description: 'Reinforcements for this occurrence.',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInfrastructureOccurrenceReinforcementDto)
  reinforcements?: UpdateInfrastructureOccurrenceReinforcementDto[];
}

export class UpdateInfrastructureOccurrenceDto extends PartialType(
  CreateInfrastructureOccurrenceDto
) {
  @ApiProperty({
    description: 'ID of the infrastructure occurrence (for upsert operation)',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdateInfrastructureOccurrenceWithRelationsDto extends PartialType(
  CreateInfrastructureOccurrenceWithRelationsDto
) {}
