import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Prisma } from '@sisman/prisma';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserDto } from '../users/user.dto';
import { UpdateInfrastructureOccurrenceDto } from '../infrastructure-occurrences/infrastructure-occurrence.dto';

export class CreateInfrastructureOccurrenceReinforcementDto
  implements
    Omit<
      Prisma.InfrastructureOccurrenceReinforcementCreateManyInput,
      'occurrenceId' | 'userId'
    >
{
  @ApiProperty({
    description: 'Comment provided by the user for the reinforcement.',
    example: 'I confirm this issue is present and needs attention.',
    required: false
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description:
      'Date and time when the reinforcement was made (ISO 8601 format).',
    example: '2023-10-27T10:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  reinforcedAt?: string | Date;
}

export class CreateInfrastructureOccurrenceReinforcementWithRelationsDto extends CreateInfrastructureOccurrenceReinforcementDto {
  @ApiProperty({
    type: () => UpdateInfrastructureOccurrenceDto,
    description: 'The infrastructure occurrence being reinforced.',
    required: true
  })
  @IsNotEmpty()
  @Type(() => UpdateInfrastructureOccurrenceDto)
  occurrence: UpdateInfrastructureOccurrenceDto;

  @ApiProperty({
    type: () => UpdateUserDto,
    description: 'The user who reinforced the occurrence.',
    required: true
  })
  @IsNotEmpty()
  @Type(() => UpdateUserDto)
  user: UpdateUserDto;
}

export class UpdateInfrastructureOccurrenceReinforcementDto extends PartialType(
  CreateInfrastructureOccurrenceReinforcementDto
) {
  @ApiProperty({
    description: 'ID of the occurrence reinforcement (for upsert operation)',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdateInfrastructureOccurrenceReinforcementWithRelationsDto extends PartialType(
  CreateInfrastructureOccurrenceReinforcementWithRelationsDto
) {}
