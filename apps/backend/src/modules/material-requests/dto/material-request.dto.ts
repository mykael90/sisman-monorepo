import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  $Enums,
  Prisma,
  MaterialRequestItemType,
  MaterialRequestOrigin,
  MaterialRequestPurpose,
  MaterialRequestStatusOptions,
  MaterialRequestType
} from '@sisman/prisma';
import { DecimalJsLike } from '@sisman/prisma/generated/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  ValidateIf,
  IsArray,
  ValidateNested
} from 'class-validator';
import { UpdateSipacUnidadeDto } from '../../sipac/unidades/dto/sipac-unidade.dto';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto
} from '../../warehouses/dto/warehouse.dto';

export class CreateMaterialRequestDto
  implements Omit<Prisma.MaterialRequestCreateManyInput, 'warehouseId'>
{
  createdAt?: string | Date;
  updatedAt?: string | Date;
  sipacUnitRequestingId?: number;
  sipacUnitCostId?: number;
  // warehouseId: number;
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
    // Correção para usar o enum importado diretamente
    // enum: MaterialRequestType,
    example: $Enums.MaterialRequestType.NEW_MATERIALS,
    required: false
  })
  @IsOptional()
  @IsEnum(MaterialRequestType) // Usando o enum importado
  requestType?: MaterialRequestType;

  @ApiProperty({
    description: 'Propósito da requisição de material',
    enum: MaterialRequestPurpose,
    example: MaterialRequestPurpose.SUPPLY_MAINTENANCE,
    required: false
  })
  @IsOptional()
  @IsEnum(MaterialRequestPurpose)
  purpose?: MaterialRequestPurpose;

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
    description: 'Usuario que realizou a requisicao de material',
    example: 'mykael.mello',
    required: false
  })
  @IsOptional()
  @IsString()
  sipacUserLoginRequest?: string;

  @ApiProperty({
    description: 'Origem da requisição de material',
    enum: $Enums.MaterialRequestOrigin,
    // Correção para usar o enum importado diretamente
    // enum: MaterialRequestOrigin,
    example: $Enums.MaterialRequestOrigin.SISMAN,
    required: false
  })
  @IsOptional()
  @IsEnum(MaterialRequestOrigin) // Usando o enum importado
  origin?: MaterialRequestOrigin;

  @ApiProperty({
    description: 'Valor solicitado (pode ser string, número ou Decimal)',
    example: 150.75,
    required: false
  })
  @IsOptional()
  // Validação mais complexa pode ser necessária dependendo do formato esperado
  @ValidateIf((o) => o.requestValue !== undefined)
  @IsNumber({}, { message: 'O valor solicitado deve ser um número válido.' })
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
  @IsNumber({}, { message: 'O valor atendido deve ser um número válido.' })
  @Type(() => Number) // Tenta converter para número, mas pode precisar de lógica customizada para Decimal
  servedValue?: string | number | Prisma.Decimal | DecimalJsLike;

  // @ApiProperty({
  //   description: 'ID do armazém de onde o material será retirado',
  //   example: 1
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // @Type(() => Number)
  // warehouseId: number;
}

export class CreateMaterialRequestItemDto
  implements
    Omit<Prisma.MaterialRequestItemCreateManyInput, 'materialRequestId'>
{
  // @ApiProperty({
  //   description: 'ID da requisição de material à qual este item pertence.',
  //   example: 1
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // materialRequestId: number;

  @ApiProperty({
    description: 'Tipo do item da requisição de material.',
    enum: $Enums.MaterialRequestItemType,
    // Correção para usar o enum importado diretamente
    // enum: MaterialRequestItemType,
    example: $Enums.MaterialRequestItemType.GLOBAL_CATALOG,
    required: false
  })
  @IsOptional()
  @IsEnum(MaterialRequestItemType) // Usando o enum importado
  requestType?: MaterialRequestItemType; // Tipo já estava correto aqui

  @ApiProperty({
    description: 'ID global do material solicitado.',
    example: 'MAT-001',
    required: false
  })
  @IsOptional()
  @IsString()
  requestedGlobalMaterialId?: string;

  @ApiProperty({
    description:
      'ID da instância do material que atendeu ao item (se aplicável).',
    example: 101,
    required: false
  })
  @IsOptional()
  @IsNumber()
  fulfilledByInstanceId?: number;

  @ApiProperty({
    description: 'Quantidade solicitada do material.',
    example: 10
  })
  @IsNumber()
  @IsPositive() // Ensures quantity is a positive number
  @IsNotEmpty()
  @Type(() => Number) // Ensures transformation from string if necessary
  quantityRequested: number | Prisma.Decimal | DecimalJsLike;

  @ApiProperty({
    description: 'Quantidade aprovada do material.',
    example: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantityApproved?: number | Prisma.Decimal | DecimalJsLike;

  @ApiProperty({
    description: 'Quantidade entregue do material.',
    example: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantityDelivered?: number | Prisma.Decimal | DecimalJsLike;

  // @ApiProperty({ description: 'Unidade de medida do material.', example: 'UN' })
  // @IsString()
  // @IsNotEmpty()
  // unitOfMeasure: string;

  @ApiProperty({
    description: 'Observações adicionais sobre o item.',
    example: 'Urgente',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMaterialRequestStatusDto
  implements
    Omit<Prisma.MaterialRequestStatusCreateManyInput, 'materialRequestId'>
{
  @ApiProperty({
    description: 'ID do status (geralmente gerado automaticamente)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  // @ApiProperty({
  //   description: 'ID da requisição de material à qual este status pertence.',
  //   example: 1
  // })
  // @IsNumber()
  // @IsNotEmpty()
  // materialRequestId: number;

  @ApiProperty({
    description: 'Status da requisição de material.',
    enum: MaterialRequestStatusOptions,
    example: MaterialRequestStatusOptions.APPROVED
  })
  @IsEnum(MaterialRequestStatusOptions)
  @IsNotEmpty()
  status: MaterialRequestStatusOptions;

  @ApiProperty({
    description: 'ID do usuário que alterou o status.',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  changedById?: number;

  @ApiProperty({
    description: 'Data da alteração do status (formato ISO 8601).',
    example: '2023-10-27T10:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  changeDate?: string | Date;

  @ApiProperty({
    description: 'Observações sobre a alteração de status.',
    example: 'Aprovado pelo gerente.',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMaterialRequestWithRelationsDto extends CreateMaterialRequestDto {
  @ApiProperty({
    type: () => [CreateMaterialRequestItemDto],
    description: 'Itens da requisição de material.',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestItemDto)
  items?: CreateMaterialRequestItemDto[];

  @ApiProperty({
    type: () => [CreateMaterialRequestStatusDto],
    description: 'Histórico de status da requisição de material.',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestStatusDto)
  statusHistory?: CreateMaterialRequestStatusDto[];

  @ApiProperty({
    type: () => CreateWarehouseDto,
    description: 'Armazém associado à requisição de material.',
    required: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateWarehouseDto)
  warehouse?: UpdateWarehouseDto;

  @ApiProperty({
    type: () => [UpdateSipacUnidadeDto],
    description: 'Unidade requisitante associada'
  })
  @IsOptional()
  @Type(() => UpdateSipacUnidadeDto)
  sipacUnitRequesting?: UpdateSipacUnidadeDto;

  @ApiProperty({
    type: () => [UpdateSipacUnidadeDto],
    description: 'Unidade de custo associada'
  })
  @IsOptional()
  @Type(() => UpdateSipacUnidadeDto)
  sipacUnitCost?: UpdateSipacUnidadeDto;
}

export class UpdateMaterialRequestDto extends PartialType(
  CreateMaterialRequestDto
) {}

export class UpdateMaterialRequestItemDto extends PartialType(
  CreateMaterialRequestItemDto // Ensure CreateMaterialRequestItemDto does not have 'id' for item itself
) {
  @ApiProperty({
    description: 'ID of the material request item (for upsert operation)',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number; // ID of the MaterialRequestItem record itself
}

export class UpdateMaterialRequestStatusDto extends PartialType(
  CreateMaterialRequestStatusDto
) {}

export class UpdateMaterialRequestWithRelationsDto extends PartialType(
  CreateMaterialRequestWithRelationsDto
) {}
