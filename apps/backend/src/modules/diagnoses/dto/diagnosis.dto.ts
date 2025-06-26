import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Prisma } from '@sisman/prisma';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateInfrastructureOccurrenceDto } from '../../infrastructure-occurrences/dto/infrastructure-occurrence.dto';
import { UpdateUserDto } from '../../users/dto/user.dto';
import { UpdateMaintenanceRequestDto } from '../../maintenance-requests/dto/maintenance-request.dto';

export class CreateDiagnosisDto
  implements
    Omit<Prisma.DiagnosisCreateManyInput, 'occurrenceId' | 'analyzedById'>
{
  @ApiProperty({
    description: 'Detailed diagnostic findings.',
    example: 'The main circuit breaker for the HVAC unit is faulty.',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  diagnosticDetails: string;

  @ApiProperty({
    description: 'Prognosis or expected outcome without intervention.',
    example: 'If not repaired, the unit will completely fail within a week.',
    required: false
  })
  @IsOptional()
  @IsString()
  prognosis?: string;

  @ApiProperty({
    description: 'Notes on how the issue was resolved, if applicable.',
    example: 'Replaced the circuit breaker.',
    required: false
  })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @ApiProperty({
    description: 'Outcome of the diagnosis.',
    enum: $Enums.DiagnosisOutcome,
    example: $Enums.DiagnosisOutcome.CREATE_REQUEST,
    required: false
  })
  @IsOptional()
  @IsEnum($Enums.DiagnosisOutcome)
  outcome?: $Enums.DiagnosisOutcome;

  @ApiProperty({
    description: 'Date and time when the diagnosis was made (ISO 8601 format).',
    example: '2023-10-27T11:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  diagnosedAt?: string | Date;

  @ApiProperty({
    description:
      'ID of the associated Maintenance Request, if one was created from this diagnosis.',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maintenanceRequestId?: number;
}

export class CreateDiagnosisWithRelationsDto extends CreateDiagnosisDto {
  @ApiProperty({
    type: () => UpdateInfrastructureOccurrenceDto,
    description:
      'The infrastructure occurrence associated with this diagnosis.',
    required: true
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateInfrastructureOccurrenceDto)
  occurrence: UpdateInfrastructureOccurrenceDto;

  @ApiProperty({
    type: () => UpdateUserDto,
    description: 'The user who performed the diagnosis.',
    required: true
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  analyzedBy: UpdateUserDto;

  @ApiProperty({
    type: () => UpdateMaintenanceRequestDto,
    description: 'The maintenance request created from this diagnosis.',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMaintenanceRequestDto)
  maintenanceRequest?: UpdateMaintenanceRequestDto;
}

export class UpdateDiagnosisDto extends PartialType(CreateDiagnosisDto) {
  @ApiProperty({
    description: 'ID of the diagnosis (for upsert operation)',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdateDiagnosisWithRelationsDto extends PartialType(
  CreateDiagnosisWithRelationsDto
) {}
