import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Prisma } from '@sisman/prisma';
import { DecimalJsLike } from '@sisman/prisma/generated/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf
} from 'class-validator';

export class CreateMaterialRequestDto
  implements Prisma.MaterialRequestCreateManyInput
{
  @ApiProperty({
    description:
      'ID da requisição de material (geralmente gerado automaticamente)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Número do protocolo da requisição',
    example: '2023/00123',
    required: false
  })
  @IsOptional()
  @IsString()
  protocolNumber?: string;

  @ApiProperty({
    description: 'Tipo da requisição de material',
    enum: $Enums.MaterialRequestType,
    example: $Enums.MaterialRequestType.NEW_MATERIALS,
    required: false
  })
  @IsOptional()
  @IsEnum($Enums.MaterialRequestType)
  requestType?: $Enums.MaterialRequestType;

  @ApiProperty({
    description: 'Justificativa para a requisição',
    example: 'Necessário para reparo do equipamento X',
    required: false
  })
  @IsOptional()
  @IsString()
  justification?: string;

  @ApiProperty({
    description: 'Data da requisição (formato ISO 8601)',
    example: '2023-10-27T10:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  requestDate?: string | Date;

  @ApiProperty({
    description: 'ID da requisição de manutenção associada',
    example: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maintenanceRequestId?: number;

  @ApiProperty({
    description: 'ID do usuário que solicitou',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  requestedById?: number;

  @ApiProperty({
    description: 'Unidade SIPAC solicitante',
    example: 'DEPTO-XYZ',
    required: false
  })
  @IsOptional()
  @IsString()
  sipacUnitRequesting?: string;

  @ApiProperty({
    description: 'Unidade de custo SIPAC',
    example: 'CUSTO-ABC',
    required: false
  })
  @IsOptional()
  @IsString()
  sipacUnitCost?: string;

  @ApiProperty({
    description: 'Origem da requisição de material',
    enum: $Enums.MaterialRequestOrigin,
    example: $Enums.MaterialRequestOrigin.SISMAN,
    required: false
  })
  @IsOptional()
  @IsEnum($Enums.MaterialRequestOrigin)
  origin?: $Enums.MaterialRequestOrigin;

  @ApiProperty({
    description: 'Valor solicitado (pode ser string, número ou Decimal)',
    example: 150.75,
    required: false
  })
  @IsOptional()
  // Validação mais complexa pode ser necessária dependendo do formato esperado
  @ValidateIf((o) => o.requestValue !== undefined)
  @Type(() => Number) // Tenta converter para número, mas pode precisar de lógica customizada para Decimal
  requestValue?: string | number | Prisma.Decimal | DecimalJsLike;

  @ApiProperty({
    description: 'Valor atendido (pode ser string, número ou Decimal)',
    example: 150.0,
    required: false
  })
  @IsOptional()
  // Validação mais complexa pode ser necessária dependendo do formato esperado
  @ValidateIf((o) => o.servedValue !== undefined)
  @Type(() => Number) // Tenta converter para número, mas pode precisar de lógica customizada para Decimal
  servedValue?: string | number | Prisma.Decimal | DecimalJsLike;

  @ApiProperty({
    description: 'ID do armazém de onde o material será retirado',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  warehouseId: number;
}

export class UpdateMaterialRequestDto extends PartialType(
  CreateMaterialRequestDto
) {}
