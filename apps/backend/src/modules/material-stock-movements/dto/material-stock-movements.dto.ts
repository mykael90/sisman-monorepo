import { MaterialStockMovement, Prisma } from '@sisman/prisma';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { UpdateStorageDto } from '../../storages/dto/storage.dto';
import { UpdateSipacMaterialDto } from '../../sipac/materiais/dto/sipac-material.dto';
import { MaterialWarehouseStockWithRelationsResponseDto } from '../../material-warehouse-stocks/dto/material-warehouse-stock.dto';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */
class MaterialStockMovementBaseDto implements MaterialStockMovement {
  collectedByWorkerId: number;
  id: number;
  warehouseId: number;
  globalMaterialId: string;
  materialInstanceId: number;
  movementTypeId: number;
  quantity: Prisma.Decimal;
  unitOfMeasure: string;
  movementDate: Date;
  createdAt: Date;
  updatedAt: Date;
  processedByUserId: number;
  collectedByUserId: number;
  warehouseMaterialStockId: number;
  materialRequestItemId: number;
  maintenanceRequestId: number;
  materialWithdrawalItemId: number;
  materialReceiptItemId: number;
  stockTransferOrderItemId: number;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const MaterialStockMovementRelationOnlyArgs =
  Prisma.validator<Prisma.MaterialStockMovementDefaultArgs>()({
    select: {
      warehouse: true,
      globalMaterial: true,
      materialInstance: true,
      movementType: true,
      processedByUser: true,
      collectedByUser: true,
      collectedByWorker: true,
      warehouseMaterialStock: true,
      materialRequestItem: true,
      maintenanceRequest: true,
      materialWithdrawalItem: true,
      materialReceiptItem: true
    }
  });

type MaterialStockMovementRelationOnly = Prisma.MaterialStockMovementGetPayload<
  typeof MaterialStockMovementRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class MaterialStockMovementWithRelationsResponseDto
  extends MaterialStockMovementBaseDto
  implements Partial<MaterialStockMovementRelationOnly>
{
  /**
   * Dados do almoxarifado onde a movimentação ocorreu.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStorageDto)
  warehouse?: MaterialStockMovementRelationOnly['warehouse'];

  /**
   * Dados do material global associado a esta movimentação.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSipacMaterialDto)
  globalMaterial?: MaterialStockMovementRelationOnly['globalMaterial'];

  /**
   * Dados da instância específica do material, se aplicável.
   */
  @IsOptional()
  @ValidateNested()
  // @Type(() => MaterialInstanceDto) // TODO: Criar e importar o DTO apropriado
  materialInstance?: MaterialStockMovementRelationOnly['materialInstance'];

  /**
   * Dados do tipo de movimentação de estoque.
   */
  @IsOptional()
  @ValidateNested()
  // @Type(() => MovementTypeDto) // TODO: Criar e importar o DTO apropriado
  movementType?: MaterialStockMovementRelationOnly['movementType'];

  /**
   * Dados do usuário que processou a movimentação.
   */
  @IsOptional()
  @ValidateNested()
  // @Type(() => UserDto) // TODO: Criar e importar o DTO apropriado
  processedByUser?: MaterialStockMovementRelationOnly['processedByUser'];

  /**
   * Dados do usuário que coletou o material.
   */
  @IsOptional()
  @ValidateNested()
  // @Type(() => UserDto) // TODO: Criar e importar o DTO apropriado
  collectedByUser?: MaterialStockMovementRelationOnly['collectedByUser'];

  /**
   * Dados do trabalhador que coletou o material.
   */
  @IsOptional()
  @ValidateNested()
  // @Type(() => WorkerDto) // TODO: Criar e importar o DTO apropriado
  collectedByWorker?: MaterialStockMovementRelationOnly['collectedByWorker'];

  /**
   * Dados do estoque do material no almoxarifado.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => MaterialWarehouseStockWithRelationsResponseDto)
  warehouseMaterialStock?: MaterialStockMovementRelationOnly['warehouseMaterialStock'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateMaterialStockMovementDto extends IntersectionType(
  PartialType(MaterialStockMovementBaseDto),
  PickType(MaterialStockMovementBaseDto, [
    'warehouseId',
    'movementTypeId',
    'quantity',
    'unitOfMeasure'
  ] as const)
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateMaterialStockMovementDto extends PartialType(
  CreateMaterialStockMovementDto
) {}
