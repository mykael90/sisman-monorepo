import { PartialType } from '@nestjs/swagger';
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
  CreateStorageDto,
  UpdateStorageDto
} from '../../storages/dto/storage.dto';

export class CreateMaterialRequestDto
  implements Omit<Prisma.MaterialRequestCreateManyInput, 'storageId'>
{
  /**
   * ID da requisição de material (geralmente gerado automaticamente)
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  id?: number;

  /**
   * Número do protocolo da requisição
   * @example '2023/00123'
   */
  @IsOptional()
  @IsString()
  protocolNumber?: string;

  /**
   * Tipo da requisição de material
   * @example NEW_MATERIALS
   */
  @IsOptional()
  @IsEnum(MaterialRequestType) // Usando o enum importado
  requestType?: MaterialRequestType;

  /**
   * Propósito da requisição de material
   * @example SUPPLY_MAINTENANCE
   */
  @IsOptional()
  @IsEnum(MaterialRequestPurpose)
  purpose?: MaterialRequestPurpose;

  /**
   * Justificativa para a requisição
   * @example 'Necessário para reparo do equipamento X'
   */
  @IsOptional()
  @IsString()
  justification?: string;

  /**
   * Data da requisição (formato ISO 8601)
   * @example '2023-10-27T10:00:00.000Z'
   */
  @IsOptional()
  @IsDateString()
  requestDate?: string | Date;

  /**
   * ID da requisição de manutenção associada
   * @example 10
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maintenanceRequestId?: number;

  /**
   * ID do usuário que solicitou
   * @example 5
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  requestedById?: number;

  /**
   * Usuario que realizou a requisicao de material
   * @example 'mykael.mello'
   */
  @IsOptional()
  @IsString()
  sipacUserLoginRequest?: string;

  /**
   * Origem da requisição de material
   * @example SISMAN
   */
  @IsOptional()
  @IsEnum(MaterialRequestOrigin) // Usando o enum importado
  origin?: MaterialRequestOrigin;

  /**
   * Valor solicitado (pode ser string, número ou Decimal)
   * @example 150.75
   */
  @IsOptional()
  // Validação mais complexa pode ser necessária dependendo do formato esperado
  @ValidateIf((o) => o.requestValue !== undefined)
  @IsNumber({}, { message: 'O valor solicitado deve ser um número válido.' })
  @Type(() => Number) // Tenta converter para número, mas pode precisar de lógica customizada para Decimal
  requestValue?: string | number | Prisma.Decimal | DecimalJsLike;

  /**
   * Valor atendido (pode ser string, número ou Decimal)
   * @example 150.0
   */
  @IsOptional()
  // Validação mais complexa pode ser necessária dependendo do formato esperado
  @ValidateIf((o) => o.servedValue !== undefined)
  @IsNumber({}, { message: 'O valor atendido deve ser um número válido.' })
  @Type(() => Number) // Tenta converter para número, mas pode precisar de lógica customizada para Decimal
  servedValue?: string | number | Prisma.Decimal | DecimalJsLike;

  /**
   * Status atual da requisição de material
   * @example APPROVED
   */
  @IsEnum(MaterialRequestStatusOptions)
  currentStatus?: MaterialRequestStatusOptions;

  /**
   * Observações adicionais sobre a requisição.
   */
  @IsOptional()
  @IsString()
  notes?: string;
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
  /**
   * Tipo do item da requisição de material.
   * @example GLOBAL_CATALOG
   */
  @IsOptional()
  @IsEnum(MaterialRequestItemType) // Usando o enum importado
  requestType?: MaterialRequestItemType; // Tipo já estava correto aqui

  /**
   * ID global do material solicitado.
   * @example 'MAT-001'
   */
  @IsOptional()
  @IsString()
  requestedGlobalMaterialId?: string;

  /**
   * ID da instância do material que atendeu ao item (se aplicável).
   * @example 101
   */
  @IsOptional()
  @IsNumber()
  fulfilledByInstanceId?: number;

  /**
   * Quantidade solicitada do material.
   * @example 10
   */
  @IsNumber()
  @IsPositive() // Ensures quantity is a positive number
  @IsNotEmpty()
  @Type(() => Number) // Ensures transformation from string if necessary
  quantityRequested: number | Prisma.Decimal | DecimalJsLike;

  /**
   * Quantidade aprovada do material.
   * @example 10
   */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantityApproved?: number | Prisma.Decimal | DecimalJsLike;

  /**
   * Quantidade entregue do material.
   * @example 10
   */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantityDelivered?: number | Prisma.Decimal | DecimalJsLike;

  // @ApiProperty({ description: 'Unidade de medida do material.', example: 'UN' })
  // @IsString()
  // @IsNotEmpty()
  // unitOfMeasure: string;
  /**
   * Observações adicionais sobre o item.
   * @example 'Urgente'
   */
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMaterialRequestStatusDto
  implements
    Omit<Prisma.MaterialRequestStatusCreateManyInput, 'materialRequestId'>
{
  /**
   * ID do status (geralmente gerado automaticamente)
   * @example 1
   */
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
  /**
   * Status da requisição de material.
   * @example APPROVED
   */
  @IsEnum(MaterialRequestStatusOptions)
  @IsNotEmpty()
  status: MaterialRequestStatusOptions;

  /**
   * ID do usuário que alterou o status.
   * @example 5
   */
  @IsOptional()
  @IsNumber()
  changedById?: number;

  /**
   * Data da alteração do status (formato ISO 8601).
   * @example '2023-10-27T10:00:00.000Z'
   */
  @IsOptional()
  @IsDateString()
  changeDate?: string | Date;

  /**
   * Observações sobre a alteração de status.
   * @example 'Aprovado pelo gerente.'
   */
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMaterialRequestWithRelationsDto extends CreateMaterialRequestDto {
  /**
   * Itens da requisição de material.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestItemDto)
  items?: CreateMaterialRequestItemDto[];

  /**
   * Histórico de status da requisição de material.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestStatusDto)
  statusHistory?: CreateMaterialRequestStatusDto[];

  /**
   * Centro de distribuição associado à requisição de material.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStorageDto)
  storage?: UpdateStorageDto;

  /**
    description: 'Unidade requisitante associada'
   */
  @IsOptional()
  @Type(() => UpdateSipacUnidadeDto)
  sipacUnitRequesting?: UpdateSipacUnidadeDto;

  /**
   * Unidade de custo associada.
   */
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
  /**
   * ID of the material request item (for upsert operation)
   * @example 1
   */
  // required: false é inferido de `id?: number;`
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
