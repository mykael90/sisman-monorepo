import { PickType } from '@nestjs/swagger';
import { IntersectionType, PartialType } from '@nestjs/swagger';
import {
  $Enums,
  MaterialRestrictionOrder,
  MaterialRestrictionOrderItem,
  Prisma
} from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { UpdateWarehouseDto } from '../warehouses/warehouse.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */
class MaterialRestrictionOrderBaseDto implements MaterialRestrictionOrder {
  /**
   * ID único da ordem de restrição de material.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  id: number;

  /**
   * Número da ordem de restrição.
   * @example "REST-001234"
   */
  @IsString()
  @IsNotEmpty()
  restrictionOrderNumber: string;

  /**
   * ID do almoxarifado onde a restrição/liberação ocorrerá.
   * @example 2
   */
  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

  // /**
  //  * Tipo de operação de restrição (RESTRICT_FOR_PAID_ITEM ou RELEASE_PAID_RESTRICTION).
  //  * @example "RESTRICT_FOR_PAID_ITEM"
  //  */
  // @IsEnum($Enums.RestrictionOperationType)
  // @IsNotEmpty()
  // operationType: $Enums.RestrictionOperationType;

  /**
   * ID do usuário que processou a ordem de restrição.
   * @example 10
   */
  @IsNumber()
  @IsNotEmpty()
  processedByUserId: number;

  /**
   * Data e hora em que a ordem de restrição foi processada.
   * @example "2024-07-25T14:00:00.000Z"
   */
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  processedAt: Date;

  /**
   * ID da requisição de material associada, se houver.
   * @example 123
   */
  @IsOptional()
  @IsNumber()
  targetMaterialRequestId: number;

  /**
   * Status atual da ordem de restrição.
   * @example "EFFECTIVE"
   */
  @IsEnum($Enums.RestrictionOrderStatus)
  @IsNotEmpty()
  status: $Enums.RestrictionOrderStatus;

  /**
   * Observações adicionais sobre a ordem de restrição.
   * @example "Restrição para item pago do pedido PC-2024-05-001."
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
}

class MateiralRestrictionOrderItemBaseDto
  implements MaterialRestrictionOrderItem
{
  id: number;
  createdAt: Date;
  updatedAt: Date;
  materialRestrictionOrderId: number;
  globalMaterialId: string;
  materialInstanceId: number;
  quantityRequested: Prisma.Decimal;
  quantityRestricted: Prisma.Decimal;
  targetMaterialRequestItemId: number;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const MaterialRestrictionOrderRelationOnlyArgs =
  Prisma.validator<Prisma.MaterialRestrictionOrderDefaultArgs>()({
    include: {
      warehouse: true,
      processedByUser: true,
      targetMaterialRequest: true,
      items: true
    }
  });

type MaterialRestrictionOrderRelationOnly =
  Prisma.MaterialRestrictionOrderGetPayload<
    typeof MaterialRestrictionOrderRelationOnlyArgs
  >;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class MaterialRestrictionOrderWithRelationsResponseDto
  extends MaterialRestrictionOrderBaseDto
  implements Partial<MaterialRestrictionOrderRelationOnly>
{
  /**
   * Dados do almoxarifado onde a movimentação ocorrerá.
   * @example { "id": 1, "name": "Almoxarifado Central" }
   */
  @ValidateNested()
  @Type(() => UpdateWarehouseDto)
  warehouse: MaterialRestrictionOrderRelationOnly['warehouse'];

  /**
   * Dados do usuário que processou a ordem de restrição.
   * @example { "id": 1, "name": "João Silva" }
   */
  @ValidateNested()
  processedByUser: MaterialRestrictionOrderRelationOnly['processedByUser'];

  /**
   * Dados da requisição de material associada, se houver.
   */
  @IsOptional()
  targetMaterialRequest?: MaterialRestrictionOrderRelationOnly['targetMaterialRequest'];

  @IsDefined()
  @IsArray()
  items: MaterialRestrictionOrderRelationOnly['items'];
}

export class MaterialRestrictionOrderItemResponseDto extends MateiralRestrictionOrderItemBaseDto {}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateMaterialRestrictionOrderDto extends IntersectionType(
  PartialType(MaterialRestrictionOrderBaseDto),
  PickType(MaterialRestrictionOrderBaseDto, ['processedAt'] as const)
) {}

export class CreateMaterialRestrictionOrderWithRelationsDto extends IntersectionType(
  PartialType(MaterialRestrictionOrderBaseDto),
  PickType(MaterialRestrictionOrderBaseDto, ['processedAt'] as const)
) {
  /**
   * Dados do almoxarifado onde a movimentação ocorrerá.
   * @example { "id": 1, "name": "Almoxarifado Central" }
   */
  @IsDefined()
  @ValidateNested()
  @Type(() => UpdateWarehouseDto)
  warehouse: MaterialRestrictionOrderRelationOnly['warehouse'];

  /**
   * Dados do usuário que processou a ordem de restrição.
   * @example { "id": 1, "name": "João Silva" }
   */
  @IsDefined()
  processedByUser: MaterialRestrictionOrderRelationOnly['processedByUser'];

  /**
   * Dados da requisição de material associada, se houver.
   */
  @IsOptional()
  targetMaterialRequest?: MaterialRestrictionOrderRelationOnly['targetMaterialRequest'];

  @IsOptional()
  items?: MaterialRestrictionOrderRelationOnly['items'];
}

export class CreateMaterialRestrictionOrderItemDto extends IntersectionType(
  PartialType(MateiralRestrictionOrderItemBaseDto),
  PickType(MateiralRestrictionOrderItemBaseDto, [
    'quantityRestricted',
    'quantityRestricted',
    'targetMaterialRequestItemId'
  ] as const)
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateMaterialRestrictionOrderDto extends PartialType(
  CreateMaterialRestrictionOrderDto
) {}

export class UpdateMaterialRestrictionOrderWithRelationsDto extends PartialType(
  CreateMaterialRestrictionOrderWithRelationsDto
) {}

export class UpdateMaterialRestrictionOrderItemDto extends PartialType(
  CreateMaterialRestrictionOrderItemDto
) {}

// ==
