import { OmitType, PartialType } from '@nestjs/swagger';
import {
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
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { UpdateSipacUnidadeDto } from '../../sipac/unidades/dto/sipac-unidade.dto';
import { UpdateStorageDto } from '../../storages/dto/storage.dto';

// =================================================================
// 1. DTOs DE RESPOSTA (FONTE DA VERDADE PARA SCHEMAS)
// =================================================================

/**
 * Representa um item da requisição na resposta da API. Inclui o ID.
 */
export class MaterialRequestItemResponseDto {
  /**
   * ID único do item da requisição
   * @example 101
   */
  @IsNumber()
  id: number;

  /**
   * Tipo do item da requisição de material.
   * @example GLOBAL_CATALOG
   */
  @IsOptional()
  @IsEnum(MaterialRequestItemType)
  requestType?: MaterialRequestItemType;

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
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
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

  /**
   * Observações adicionais sobre o item.
   * @example 'Urgente'
   */
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Representa um status do histórico na resposta da API. Inclui o ID.
 */
export class MaterialRequestStatusResponseDto {
  /**
   * ID único do registro de status
   * @example 201
   */
  @IsNumber()
  id: number;

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

/**
 * DTO principal para respostas da API. Esta é a classe mais completa,
 * representando a entidade `MaterialRequest` com suas relações.
 * É a fonte da verdade para o schema da API.
 */
export class MaterialRequestWithRelationsResponseDto {
  /**
   * ID da requisição de material (gerado automaticamente)
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * Data de criação do registro
   * @example '2023-10-27T09:00:00.000Z'
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data da última atualização do registro
   * @example '2023-10-27T10:00:00.000Z'
   */
  @IsDate()
  updatedAt: Date;

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
  @IsEnum(MaterialRequestType)
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
  @IsEnum(MaterialRequestOrigin)
  origin?: MaterialRequestOrigin;

  /**
   * Valor solicitado (pode ser string, número ou Decimal)
   * @example 150.75
   */
  @IsOptional()
  @ValidateIf((o) => o.requestValue !== undefined)
  @IsNumber({}, { message: 'O valor solicitado deve ser um número válido.' })
  @Type(() => Number)
  requestValue?: string | number | Prisma.Decimal | DecimalJsLike;

  /**
   * Valor atendido (pode ser string, número ou Decimal)
   * @example 150.0
   */
  @IsOptional()
  @ValidateIf((o) => o.servedValue !== undefined)
  @IsNumber({}, { message: 'O valor atendido deve ser um número válido.' })
  @Type(() => Number)
  servedValue?: string | number | Prisma.Decimal | DecimalJsLike;

  /**
   * Status atual da requisição de material
   * @example APPROVED
   */
  @IsOptional() // Current status pode ser opcional dependendo da lógica de criação
  @IsEnum(MaterialRequestStatusOptions)
  currentStatus?: MaterialRequestStatusOptions;

  /**
   * Observações adicionais sobre a requisição.
   */
  @IsOptional()
  @IsString()
  notes?: string;

  /**
   * Itens da requisição de material.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialRequestItemResponseDto) // Usa a DTO de Resposta de Item
  items?: MaterialRequestItemResponseDto[];

  /**
   * Histórico de status da requisição de material.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialRequestStatusResponseDto) // Usa a DTO de Resposta de Status
  statusHistory?: MaterialRequestStatusResponseDto[];

  /**
   * Centro de distribuição associado à requisição de material.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStorageDto)
  storage?: UpdateStorageDto;

  /**
   * Unidade requisitante associada
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

// =================================================================
// 2. DTOs DE CRIAÇÃO (INPUT) - Derivadas das DTOs de Resposta
// =================================================================

/**
 * DTO para criar um item de requisição. Omite o ID que é gerado pelo banco.
 */
export class CreateMaterialRequestItemDto extends OmitType(
  MaterialRequestItemResponseDto,
  ['id'] as const
) {
  /**
   * ID da requisição de material (geralmente gerado automaticamente)
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  id?: number;
}

/**
 * DTO para criar um status de requisição. Omite o ID que é gerado pelo banco.
 */
export class CreateMaterialRequestStatusDto extends OmitType(
  MaterialRequestStatusResponseDto,
  ['id'] as const
) {
  /**
   * ID de status da requisição de material (geralmente gerado automaticamente)
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  id?: number;
}

/**
 * DTO para criar uma requisição de material com suas relações.
 * Omite campos gerados pelo servidor como 'id', 'createdAt', 'updatedAt'.
 */
export class CreateMaterialRequestWithRelationsDto extends OmitType(
  MaterialRequestWithRelationsResponseDto,
  ['id', 'createdAt', 'updatedAt', 'items', 'statusHistory'] as const
) {
  // Sobrescreve as propriedades aninhadas para usar as DTOs de CRIAÇÃO corretas
  /**
   * ID da requisição de material (geralmente gerado automaticamente)
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  id?: number;

  /**
   * Itens da requisição de material.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestItemDto) // <- Usa a DTO de Criação de Item
  items?: CreateMaterialRequestItemDto[];

  /**
   * Histórico de status da requisição de material.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestStatusDto) // <- Usa a DTO de Criação de Status
  statusHistory?: CreateMaterialRequestStatusDto[];
}

// =================================================================
// 3. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas das DTOs de Criação
// =================================================================

/**
 * DTO para atualizar uma requisição de material (apenas campos principais).
 * Usa PartialType para tornar todos os campos opcionais.
 */
export class UpdateMaterialRequestDto extends PartialType(
  // A base para a atualização não deve incluir as relações
  OmitType(MaterialRequestWithRelationsResponseDto, [
    'id',
    'createdAt',
    'updatedAt',
    'items',
    'statusHistory',
    'storage',
    'sipacUnitRequesting',
    'sipacUnitCost'
  ] as const)
) {}

/**
 * DTO para atualizar/inserir (upsert) um item de requisição.
 * O ID é opcional para identificar qual item atualizar.
 */
export class UpdateMaterialRequestItemDto extends PartialType(
  CreateMaterialRequestItemDto
) {
  /**
   * ID do item da requisição (usado para identificar o item a ser atualizado)
   * @example 101
   */
  @IsOptional()
  @IsNumber()
  id?: number;
}

/**
 * DTO para atualizar/inserir um status de requisição.
 */
export class UpdateMaterialRequestStatusDto extends PartialType(
  CreateMaterialRequestStatusDto
) {
  /**
   * ID do status (usado para identificar o status a ser atualizado)
   * @example 201
   */
  @IsOptional()
  @IsNumber()
  id?: number;
}

/**
 * DTO para atualizar uma requisição de material com suas relações.
 * Torna todos os campos opcionais.
 */
export class UpdateMaterialRequestWithRelationsDto extends PartialType(
  OmitType(CreateMaterialRequestWithRelationsDto, ['items'] as const)
) {
  // Sobrescreve as propriedades aninhadas para usar as DTOs de ATUALIZAÇÃO corretas
  /**
   * ID de status da requisição de material (geralmente gerado automaticamente)
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  id?: number;
  /**
   * Itens da requisição de material.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMaterialRequestItemDto) // <- Usa a DTO de Atualização de Item
  items?: UpdateMaterialRequestItemDto[];
}
