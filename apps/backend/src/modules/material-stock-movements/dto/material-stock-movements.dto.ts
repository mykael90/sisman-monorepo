import { MaterialStockMovement, Prisma } from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsOptional,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
  IsString,
  IsDate
} from 'class-validator';
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
  /**
   * ID do trabalhador que coletou o material.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  collectedByWorkerId: number;

  /**
   * ID único da movimentação de estoque.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  id: number;

  /**
   * ID do almoxarifado onde a movimentação ocorreu.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

  /**
   * ID global do material associado a esta movimentação.
   * @example "MAT001"
   */
  @IsString()
  @IsNotEmpty()
  globalMaterialId: string;

  /**
   * ID da instância específica do material, se aplicável.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  materialInstanceId: number;

  /**
   * ID do tipo de movimentação de estoque.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  movementTypeId: number;

  /**
   * Quantidade do material movimentado.
   * @example 10.5
   */
  @IsNumber()
  @IsNotEmpty()
  quantity: Prisma.Decimal;

  /**
   * Unidade de medida do material.
   * @example "UN"
   */
  @IsString()
  @IsNotEmpty()
  unitOfMeasure: string;

  /**
   * Data e hora da movimentação.
   * @example "2023-01-15T10:00:00Z"
   */
  @IsDate()
  @IsNotEmpty()
  movementDate: Date;

  /**
   * Data e hora de criação do registro.
   * @example "2023-01-15T09:00:00Z"
   */
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  /**
   * Data e hora da última atualização do registro.
   * @example "2023-01-15T11:00:00Z"
   */
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  /**
   * ID do usuário que processou a movimentação.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  processedByUserId: number;

  /**
   * ID do usuário que coletou o material.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  collectedByUserId: number;

  /**
   * ID do estoque do material no almoxarifado.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  warehouseMaterialStockId: number;

  /**
   * ID do item da requisição de material, se aplicável.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  materialRequestItemId: number;

  /**
   * ID da requisição de manutenção, se aplicável.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  maintenanceRequestId: number;

  /**
   * ID do item de retirada de material, se aplicável.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  materialWithdrawalItemId: number;

  /**
   * ID do item de recebimento de material, se aplicável.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  materialReceiptItemId: number;

  /**
   * ID do item da ordem de transferência de estoque, se aplicável.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
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
   * @example { "id": 1, "name": "Almoxarifado Central" }
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStorageDto)
  warehouse?: MaterialStockMovementRelationOnly['warehouse'];

  /**
   * Dados do material global associado a esta movimentação.
   * @example { "id": "MAT001", "name": "Parafuso" }
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSipacMaterialDto)
  globalMaterial?: MaterialStockMovementRelationOnly['globalMaterial'];

  /**
   * Dados da instância específica do material, se aplicável.
   * @example { "id": 1, "serialNumber": "SN123" }
   */
  @IsOptional()
  @ValidateNested()
  // @Type(() => MaterialInstanceDto) // TODO: Criar e importar o DTO apropriado
  materialInstance?: MaterialStockMovementRelationOnly['materialInstance'];

  /**
   * Dados do tipo de movimentação de estoque.
   * @example { "id": 1, "description": "Entrada por Compra" }
   */
  @IsOptional()
  @ValidateNested()
  // @Type(() => MovementTypeDto) // TODO: Criar e importar o DTO apropriado
  movementType?: MaterialStockMovementRelationOnly['movementType'];

  /**
   * Dados do usuário que processou a movimentação.
   * @example { "id": 1, "name": "João Silva" }
   */
  @IsOptional()
  @ValidateNested()
  // @Type(() => UserDto) // TODO: Criar e importar o DTO apropriado
  processedByUser?: MaterialStockMovementRelationOnly['processedByUser'];

  /**
   * Dados do usuário que coletou o material.
   * @example { "id": 2, "name": "Maria Souza" }
   */
  @IsOptional()
  @ValidateNested()
  // @Type(() => UserDto) // TODO: Criar e importar o DTO apropriado
  collectedByUser?: MaterialStockMovementRelationOnly['collectedByUser'];

  /**
   * Dados do trabalhador que coletou o material.
   * @example { "id": 3, "name": "Pedro Santos" }
   */
  @IsOptional()
  @ValidateNested()
  // @Type(() => WorkerDto) // TODO: Criar e importar o DTO apropriado
  collectedByWorker?: MaterialStockMovementRelationOnly['collectedByWorker'];

  /**
   * Dados do estoque do material no almoxarifado.
   * @example { "id": 1, "quantity": 100 }
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
