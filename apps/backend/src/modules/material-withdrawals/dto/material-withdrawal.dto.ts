import {
  IntersectionType,
  PartialType,
  OmitType,
  PickType
} from '@nestjs/swagger';
import { Prisma, MaterialWithdrawal } from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { UpdateWarehouseDto } from '../../warehouses/dto/warehouse.dto';
import { MaterialStockMovementType } from '@sisman/prisma'; // Import MaterialStockMovementType
import {
  MaterialGlobalCatalog,
  MaterialDerived,
  MaterialRequestItem
} from '@sisman/prisma'; // Import related models for items

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base para MaterialWithdrawal.
 * @hidden
 */
class MaterialWithdrawalBaseDto implements MaterialWithdrawal {
  /**
   * ID único da retirada de material.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  id: number;

  /**
   * Número da retirada (protocolo interno).
   * @example "RET-001234"
   */
  @IsString()
  @IsNotEmpty()
  withdrawalNumber: string;

  /**
   * ID do almoxarifado de origem.
   * @example 2
   */
  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

  /**
   * ID do usuário que processou a retirada no sistema.
   * @example 10
   */
  @IsNumber()
  @IsNotEmpty()
  processedByUserId: number;

  /**
   * ID do usuário que efetivamente retirou o material.
   * @example 11
   */
  @IsOptional()
  @IsNumber()
  collectedByUserId: number;

  /**
   * ID do trabalhador que efetivamente retirou o material.
   * @example 12
   */
  @IsOptional()
  @IsNumber()
  collectedByWorkerId: number;

  /**
   * Data e hora da retirada.
   * @example "2024-07-25T14:00:00.000Z"
   */
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  withdrawalDate: Date;

  /**
   * ID da requisição de manutenção associada, se houver.
   * @example 123
   */
  @IsOptional()
  @IsNumber()
  maintenanceRequestId: number;

  /**
   * ID da requisição de material geral que está sendo atendida, se houver.
   * @example 456
   */
  @IsOptional()
  @IsNumber()
  materialRequestId: number;

  /**
   * ID da ordem de separação/reserva específica, se houver.
   * @example 789
   */
  @IsOptional()
  @IsNumber()
  materialPickingOrderId: number;

  /**
   * ID do tipo de movimento de estoque (ex: Saída para Uso em Serviço).
   * @example 3
   */
  @IsNumber()
  @IsNotEmpty()
  movementTypeId: number;

  /**
   * Observações adicionais sobre a retirada.
   * @example "Retirada para manutenção corretiva da máquina X."
   */
  @IsOptional()
  @IsString()
  notes: string;

  /**
   * Data e hora de criação do registro.
   */
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  /**
   * Data e hora da última atualização do registro.
   */
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @IsOptional()
  @IsString()
  legacy_place: string;
}

/**
 * Classe base para MaterialWithdrawalItem.
 * @hidden
 */
class MaterialWithdrawalItemBaseDto {
  /**
   * ID da retirada de material pai.
   * @example 1
   */
  @IsNumber()
  @IsOptional()
  materialWithdrawalId: number;

  /**
   * ID do material do catálogo global, se aplicável.
   * @example "MAT-001"
   */
  @IsOptional()
  @IsString()
  globalMaterialId: string;

  /**
   * ID da instância de material derivado, se aplicável.
   * @example 101
   */
  @IsOptional()
  @IsNumber()
  materialInstanceId: number;

  /**
   * Quantidade de material retirada.
   * @example 5.50
   */
  @IsNumber()
  quantityWithdrawn: Prisma.Decimal; // No IsNotEmpty here, as it will be picked for Create DTO

  /**
   * ID do item da requisição de material que está sendo atendido, se houver.
   * @example 201
   */
  @IsOptional()
  @IsNumber()
  materialRequestItemId: number;

  /**
   * Data e hora de criação do registro.
   */
  @IsDate()
  @IsOptional() // Optional for creation DTOs
  createdAt: Date;

  /**
   * Data e hora da última atualização do registro.
   */
  @IsDate()
  @IsOptional() // Optional for creation DTOs
  updatedAt: Date;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const MaterialWithdrawalRelationOnlyArgs =
  Prisma.validator<Prisma.MaterialWithdrawalDefaultArgs>()({
    include: {
      warehouse: true,
      processedByUser: true,
      collectedByUser: true,
      collectedByWorker: true,
      maintenanceRequest: true,
      materialRequest: true,
      materialPickingOrder: true,
      movementType: true,
      items: true
    }
  });

type MaterialWithdrawalRelationOnly = Prisma.MaterialWithdrawalGetPayload<
  typeof MaterialWithdrawalRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa de MaterialWithdrawal, incluindo suas relações.
 */
export class MaterialWithdrawalWithRelationsResponseDto
  extends MaterialWithdrawalBaseDto
  implements Partial<MaterialWithdrawalRelationOnly>
{
  /**
   * Dados do almoxarifado de origem.
   */
  @ValidateNested()
  @Type(() => UpdateWarehouseDto)
  warehouse: MaterialWithdrawalRelationOnly['warehouse'];

  /**
   * Dados do usuário que processou a retirada.
   */
  @ValidateNested()
  processedByUser: MaterialWithdrawalRelationOnly['processedByUser'];

  /**
   * Dados do usuário que coletou o material.
   */
  @ValidateNested()
  collectedByUser: MaterialWithdrawalRelationOnly['collectedByUser'];

  /**
   * Dados do trabalhador que coletou o material.
   */
  @ValidateNested()
  collectedByWorker: MaterialWithdrawalRelationOnly['collectedByWorker'];

  /**
   * Dados da requisição de manutenção associada.
   */
  @ValidateNested()
  maintenanceRequest: MaterialWithdrawalRelationOnly['maintenanceRequest'];

  /**
   * Dados da requisição de material geral.
   */
  @ValidateNested()
  materialRequest: MaterialWithdrawalRelationOnly['materialRequest'];

  /**
   * Dados da ordem de separação/reserva.
   */
  @ValidateNested()
  materialPickingOrder: MaterialWithdrawalRelationOnly['materialPickingOrder'];

  /**
   * Dados do tipo de movimento de estoque.
   */
  @ValidateNested()
  movementType: MaterialWithdrawalRelationOnly['movementType'];

  /**
   * Itens da retirada.
   */
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialWithdrawalItemResponseDto)
  items: MaterialWithdrawalRelationOnly['items'];
}

/**
 * DTO para representar a resposta completa de MaterialWithdrawalItem, incluindo suas relações.
 */
export class MaterialWithdrawalItemResponseDto
  extends MaterialWithdrawalItemBaseDto
  implements
    Partial<
      Prisma.MaterialWithdrawalItemGetPayload<{
        include: {
          globalMaterial: true;
          materialInstance: true;
          materialRequestItem: true;
        };
      }>
    >
{
  /**
   * ID único do item de retirada.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  id: number;

  /**
   * Data e hora de criação do registro.
   */
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  createdAt: Date;

  /**
   * Data e hora da última atualização do registro.
   */
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  updatedAt: Date;

  /**
   * Dados do material do catálogo global.
   */
  // @IsOptional()
  @ValidateNested()
  globalMaterial: MaterialGlobalCatalog;

  /**
   * Dados da instância de material derivado.
   */
  // @IsOptional()
  @ValidateNested()
  materialInstance: MaterialDerived;

  /**
   * Dados do item da requisição de material.
   */
  // @IsOptional()
  @ValidateNested()
  materialRequestItem: MaterialRequestItem;
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateMaterialWithdrawalDto extends IntersectionType(
  PartialType(MaterialWithdrawalBaseDto),
  PickType(MaterialWithdrawalBaseDto, ['withdrawalDate'] as const)
) {}

export class CreateMaterialWithdrawalItemDto extends IntersectionType(
  PickType(MaterialWithdrawalItemBaseDto, ['quantityWithdrawn'] as const),
  PartialType(
    OmitType(MaterialWithdrawalItemBaseDto, ['quantityWithdrawn'] as const)
  )
) {
  @IsOptional()
  @IsString()
  globalMaterialId?: string;

  @IsOptional()
  @IsNumber()
  materialInstanceId?: number;

  @IsOptional()
  @IsNumber()
  materialRequestItemId?: number;
}

export class CreateMaterialWithdrawalWithRelationsDto extends IntersectionType(
  PartialType(MaterialWithdrawalBaseDto),
  PickType(MaterialWithdrawalBaseDto, ['withdrawalDate'] as const)
) {
  /**
   * Dados do almoxarifado de origem.
   */
  @IsDefined()
  // @ValidateNested()
  @Type(() => UpdateWarehouseDto)
  warehouse: MaterialWithdrawalRelationOnly['warehouse'];

  /**
   * Dados do usuário que processou a retirada.
   */
  @IsDefined()
  // @ValidateNested()
  processedByUser: MaterialWithdrawalRelationOnly['processedByUser'];

  /**
   * Dados do usuário que coletou o material.
   */
  @IsOptional()
  // @ValidateNested()
  collectedByUser?: MaterialWithdrawalRelationOnly['collectedByUser'];

  /**
   * Dados do trabalhador que coletou o material.
   */
  @IsOptional()
  // @ValidateNested()
  collectedByWorker?: MaterialWithdrawalRelationOnly['collectedByWorker'];

  /**
   * Dados da requisição de manutenção associada.
   */
  @IsOptional()
  // @ValidateNested()
  maintenanceRequest?: MaterialWithdrawalRelationOnly['maintenanceRequest'];

  /**
   * Dados da requisição de material geral.
   */
  @IsOptional()
  // @ValidateNested()
  materialRequest?: MaterialWithdrawalRelationOnly['materialRequest'];

  /**
   * Dados da ordem de separação/reserva.
   */
  @IsOptional()
  // @ValidateNested()
  materialPickingOrder?: MaterialWithdrawalRelationOnly['materialPickingOrder'];

  /**
   * Dados do tipo de movimento de estoque.
   */
  @IsDefined()
  // @ValidateNested()
  movementType: MaterialWithdrawalRelationOnly['movementType'];

  /**
   * Itens da retirada.
   */
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialWithdrawalItemDto)
  items: CreateMaterialWithdrawalItemDto[];
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateMaterialWithdrawalDto extends PartialType(
  CreateMaterialWithdrawalDto
) {}

export class UpdateMaterialWithdrawalItemDto extends IntersectionType(
  PartialType(CreateMaterialWithdrawalItemDto)
) {}

export class UpdateMaterialWithdrawalWithRelationsDto extends PartialType(
  CreateMaterialWithdrawalWithRelationsDto
) {}
