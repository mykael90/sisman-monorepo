import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType
} from '@nestjs/swagger';
import {
  Prisma,
  MaterialRequest,
  MaterialRequestItem,
  MaterialRequestStatus,
  MaterialRequestItemType,
  MaterialRequestOrigin,
  MaterialRequestPurpose,
  MaterialRequestStatusOptions,
  MaterialRequestType,
  $Enums
} from '@sisman/prisma';
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
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// =================================================================

/**
 * Classe base para um item de requisição de material.
 * @hidden
 */
class MaterialRequestItemBaseDto implements MaterialRequestItem {
  /**
   * ID único do item.
   * @example 101
   */
  @IsNumber()
  id: number;

  /**
   * ID da requisição de material à qual este item pertence.
   * @example 1
   */
  @IsNumber()
  materialRequestId: number;

  /**
   * Tipo do item da requisição.
   */
  @IsOptional()
  @IsEnum(MaterialRequestItemType)
  itemRequestType: MaterialRequestItemType | null;

  /**
   * ID global do material solicitado (se aplicável).
   * @example 'MAT-001'
   */
  @IsOptional()
  @IsString()
  requestedGlobalMaterialId: string | null;

  /**
   * ID da instância do material que atendeu ao item (se aplicável).
   * @example 101
   */
  @IsOptional()
  @IsNumber()
  fulfilledByInstanceId: number | null;

  /**
   * Quantidade solicitada do material.
   * @example 10
   */
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
  quantityRequested: Prisma.Decimal;

  /**
   * Quantidade aprovada do material.
   * @example 10
   */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantityApproved: Prisma.Decimal | null;

  /**
   * Quantidade entregue do material.
   * @example 8
   */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantityDelivered: Prisma.Decimal | null;

  /**
   * Observações adicionais sobre o item.
   * @example 'Urgente'
   */
  @IsOptional()
  @IsString()
  notes: string | null;

  /**
   * Data de criação do item.
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data da última atualização do item.
   */
  @IsDate()
  updatedAt: Date;
}

/**
 * Classe base para um status do histórico da requisição.
 * @hidden
 */
class MaterialRequestStatusBaseDto implements MaterialRequestStatus {
  /**
   * ID da requisição de material à qual este status pertence.
   * @example 1
   */
  @IsNumber()
  materialRequestId: number;

  /**
   * O status da requisição.
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
  changedById: number | null;

  /**
   * Data da alteração do status.
   */
  @IsOptional()
  @IsDateString()
  changeDate: Date | null;

  /**
   * Observações sobre a alteração de status.
   * @example 'Aprovado pelo gerente.'
   */
  @IsOptional()
  @IsString()
  notes: string | null;

  /**
   * Data de criação do registro de status.
   */
  @IsDate()
  createdAt: Date;
}

/**
 * Classe base para a requisição de material.
 * @hidden
 */
class MaterialRequestBaseDto implements MaterialRequest {
  /**
   * ID único da requisição de material.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * Data de criação da requisição.
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data da última atualização da requisição.
   */
  @IsDate()
  updatedAt: Date;

  /**
   * Número do protocolo da requisição.
   * @example '2023/00123'
   */
  @IsOptional()
  @IsString()
  protocolNumber: string | null;

  /**
   * Tipo da requisição.
   */
  @IsOptional()
  @IsEnum(MaterialRequestType)
  requestType: MaterialRequestType | null;

  /**
   * Propósito da requisição.
   */
  @IsOptional()
  @IsEnum(MaterialRequestPurpose)
  purpose: MaterialRequestPurpose | null;

  /**
   * Justificativa para a requisição.
   * @example 'Necessário para reparo do equipamento X'
   */
  @IsOptional()
  @IsString()
  justification: string | null;

  /**
   * Data da requisição.
   */
  @IsOptional()
  @IsDateString()
  requestDate: Date | null;

  /**
   * ID da requisição de manutenção associada (se houver).
   * @example 10
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maintenanceRequestId: number | null;

  /**
   * ID do usuário que solicitou.
   * @example 5
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  requestedById: number | null;

  /**
   * Login do usuário do SIPAC que realizou a requisição.
   * @example 'mykael.mello'
   */
  @IsOptional()
  @IsString()
  sipacUserLoginRequest: string | null;

  /**
   * Origem da requisição.
   */
  @IsOptional()
  @IsEnum(MaterialRequestOrigin)
  origin: MaterialRequestOrigin | null;

  /**
   * Valor total solicitado.
   * @example 150.75
   */
  @IsOptional()
  @ValidateIf((o) => o.requestValue !== undefined)
  @IsNumber({}, { message: 'O valor solicitado deve ser um número válido.' })
  @Type(() => Number)
  requestValue: Prisma.Decimal | null;

  /**
   * Valor total atendido.
   * @example 150.00
   */
  @IsOptional()
  @ValidateIf((o) => o.servedValue !== undefined)
  @IsNumber({}, { message: 'O valor atendido deve ser um número válido.' })
  @Type(() => Number)
  servedValue: Prisma.Decimal | null;

  /**
   * Status atual da requisição.
   */
  @IsOptional()
  @IsEnum(MaterialRequestStatusOptions)
  currentStatus: MaterialRequestStatusOptions | null;

  /**
   * Observações gerais sobre a requisição.
   */
  @IsOptional()
  @IsString()
  notes: string | null;

  /**
   * ID do almoxarifado associado.
   * @example 3
   */
  @IsOptional()
  @IsNumber()
  storageId: number | null;

  /**
   * ID da unidade SIPAC requisitante.
   * @example 1234
   */
  @IsOptional()
  @IsNumber()
  sipacUnitRequestingId: number | null;

  /**
   * ID da unidade de custo SIPAC.
   * @example 5678
   */
  @IsOptional()
  @IsNumber()
  sipacUnitCostId: number | null;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const MaterialRequestRelationOnlyArgs =
  Prisma.validator<Prisma.MaterialRequestDefaultArgs>()({
    select: {
      items: true,
      statusHistory: true,
      storage: true,
      sipacUnitRequesting: true,
      sipacUnitCost: true,
      maintenanceRequest: true,
      requestedBy: true
    }
  });

type MaterialRequestRelationsOnly = Prisma.MaterialRequestGetPayload<
  typeof MaterialRequestRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa de uma requisição de material, incluindo suas relações.
 */
export class MaterialRequestWithRelationsResponseDto
  extends MaterialRequestBaseDto
  implements Partial<MaterialRequestRelationsOnly>
{
  /**
   * Lista de itens associados à requisição.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialRequestItemBaseDto)
  items?: MaterialRequestItemBaseDto[];

  /**
   * Histórico de status da requisição.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialRequestStatusBaseDto)
  statusHistory?: MaterialRequestStatusBaseDto[];

  //TODO:
  /**
   * Dados do almoxarifado associado.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStorageDto) // Substituir por StorageResponseDto se existir
  storage?: MaterialRequestRelationsOnly['storage'];

  //TODO:
  /**
   * Dados da unidade SIPAC requisitante.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSipacUnidadeDto) // Substituir por SipacUnitResponseDto se existir
  sipacUnitRequesting?: MaterialRequestRelationsOnly['sipacUnitRequesting'];

  //TODO:
  /**
   * Dados da unidade de custo SIPAC.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSipacUnidadeDto) // Substituir por SipacUnitResponseDto se existir
  sipacUnitCost?: MaterialRequestRelationsOnly['sipacUnitCost'];

  //TODO:
  /**
   * Dados da requisição de manutenção vinculada
   */
  @IsOptional()
  maintenanceRequest?: MaterialRequestRelationsOnly['maintenanceRequest'];

  //TODO:
  /**
   * Dados do requisisitante
   */
  @IsOptional()
  requestedBy?: MaterialRequestRelationsOnly['requestedBy'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

/**
 * DTO para criar um novo item de requisição.
 */
export class CreateMaterialRequestItemDto extends OmitType(
  MaterialRequestItemBaseDto,
  [
    'id',
    'materialRequestId',
    'createdAt',
    'updatedAt',
    'fulfilledByInstanceId',
    'requestedGlobalMaterialId',
    'notes'
  ] as const
) {
  /**
   *    * ID global do material solicitado (se aplicável).
   * @example 'MAT-001'
.
   */
  @IsOptional()
  @IsString()
  requestedGlobalMaterialId?: string;

  /**
   *    * ID de material derivado (se aplicável).
   * @example '1'
.
   */
  @IsOptional()
  @IsNumber()
  fulfilledByInstanceId?: number;
}

/**
 * DTO para criar um novo registro de status.
 */
export class CreateMaterialRequestStatusDto extends OmitType(
  MaterialRequestStatusBaseDto,
  ['materialRequestId', 'createdAt', 'changedById', 'notes'] as const
) {
  /**
   * Observações sobre a alteração de status.
   * @example 'Aprovado pelo gerente.'
   */
  @IsOptional()
  @IsString()
  notes?: string;

  // /**
  //  * ID do usuário que alterou o status.
  //  * @example 5
  //  */
  // @IsOptional()
  // @IsNumber()
  // changedById?: number;
}

/**
 * DTO para criar uma nova requisição de material com suas relações.
 */
export class CreateMaterialRequestWithRelationsDto extends IntersectionType(
  PartialType(MaterialRequestBaseDto),
  PickType(MaterialRequestBaseDto, ['requestType'] as const)
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
   * Lista de itens a serem criados junto com a requisição.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestItemDto)
  items?: CreateMaterialRequestItemDto[];

  /**
   * Histórico de status a ser criado junto com a requisição.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestStatusDto)
  statusHistory?: CreateMaterialRequestStatusDto[];

  /**
   * Dados do almoxarifado associado.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStorageDto) // Substituir por StorageResponseDto se existir
  storage?: UpdateStorageDto;

  /**
   * Dados da unidade SIPAC requisitante.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSipacUnidadeDto) // Substituir por SipacUnitResponseDto se existir
  sipacUnitRequesting?: UpdateSipacUnidadeDto;

  /**
   * Dados da unidade de custo SIPAC.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSipacUnidadeDto) // Substituir por SipacUnitResponseDto se existir
  sipacUnitCost?: UpdateSipacUnidadeDto;
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

/**
 * DTO para atualizar ou inserir (upsert) um item de requisição.
 */
export class UpdateMaterialRequestItemDto extends PartialType(
  CreateMaterialRequestItemDto
) {
  /**
   * ID do item. Necessário para identificar o item a ser atualizado.
   * Se omitido para um item existente, pode causar erro. Se fornecido para um novo, pode ser ignorado dependendo da lógica do serviço.
   * @example 101
   */
  @IsOptional()
  @IsNumber()
  id?: number;
}

/**
 * DTO para atualizar ou inserir (upsert) um registro de status.
 */
export class UpdateMaterialRequestStatusDto extends PartialType(
  CreateMaterialRequestStatusDto
) {
  /**
   * O status da requisição.
   */
  @IsEnum(MaterialRequestStatusOptions)
  @IsNotEmpty()
  status: $Enums.MaterialRequestStatusOptions;

  /**
   * Data da alteração do status.
   */
  @IsOptional()
  @IsDateString()
  changeDate: Date;
}

/**
 * DTO para atualizar uma requisição de material existente com suas relações.
 */
export class UpdateMaterialRequestWithRelationsDto extends PartialType(
  OmitType(CreateMaterialRequestWithRelationsDto, [
    'items',
    'statusHistory'
  ] as const)
) {
  /**
   * Lista de itens a serem atualizados, criados ou removidos.
   * A lógica de `upsert` e remoção deve ser implementada no serviço.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMaterialRequestItemDto)
  items?: UpdateMaterialRequestItemDto[];

  /**
   * Histórico de status a ser atualizado ou criado.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMaterialRequestStatusDto)
  statusHistory?: UpdateMaterialRequestStatusDto[];
}
