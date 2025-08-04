import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { MaterialWarehouseStock, Prisma } from '@sisman/prisma';
import { Decimal } from '@sisman/prisma/generated/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';
import { UpdateSipacMaterialDto } from '../sipac/materiais/sipac-material.dto';
import { UpdateStorageDto } from '../storages/storage.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */
class MaterialWarehouseStockBaseDto implements MaterialWarehouseStock {
  /**
   * ID único do registro de estoque.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * ID do almoxarifado onde o material está estocado.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

  /**
   * ID do material (código do SIPAC).
   * @example "44332"
   */
  @IsString()
  @IsNotEmpty()
  materialId: string;

  /**
   * Quantidade física atual do material em estoque.
   * @example 150.5
   */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  balanceInMinusOut: Decimal;

  /**
   * Quantidade inicial de estoque registrada.
   * @example 200
   */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  initialStockQuantity: Decimal;

  /**
   * Quantidade de material com restrição de uso.
   * @example 10
   */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  restrictedQuantity: Decimal;

  /**
   * Quantidade de material reservada para requisições.
   * @example 25.5
   */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  reservedQuantity: Decimal;

  /**
   * Localização específica do material dentro do almoxarifado.
   * @example "Prateleira A, Seção 3, Caixa 5"
   */
  @IsOptional()
  @IsString()
  locationInWarehouse: string;

  /**
   * Nível mínimo de estoque desejado para este material.
   * @example 50
   */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minStockLevel: Decimal;

  /**
   * Nível máximo de estoque desejado para este material.
   * @example 500
   */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxStockLevel: Decimal;

  /**
   * Data da última contagem de estoque.
   * @example "2023-10-31T00:00:00.000Z"
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastStockCountDate: Date;

  /**
   * Custo médio do material em estoque.
   * @example 12.75
   */
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  updatedCost: Decimal;

  /**
   * Data de criação do registro.
   * @example "2023-01-15T10:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  /**
   * Data da última atualização do registro.
   * @example "2023-11-01T14:30:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const MaterialWarehouseStockRelationOnlyArgs =
  Prisma.validator<Prisma.MaterialWarehouseStockDefaultArgs>()({
    select: {
      material: true,
      warehouse: true,
      stockMovements: true
    }
  });

type MaterialWarehouseStockRelationOnly =
  Prisma.MaterialWarehouseStockGetPayload<
    typeof MaterialWarehouseStockRelationOnlyArgs
  >;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class MaterialWarehouseStockWithRelationsResponseDto
  extends MaterialWarehouseStockBaseDto
  implements Partial<MaterialWarehouseStockRelationOnly>
{
  /**
   * Dados do material associado a este estoque.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSipacMaterialDto)
  material?: MaterialWarehouseStockRelationOnly['material'];

  /**
   * Dados do almoxarifado onde o material está localizado.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStorageDto)
  warehouse?: MaterialWarehouseStockRelationOnly['warehouse'];

  /**
   * Movimentações de estoque associadas a este material no almoxarifado.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  // @Type(() => UpdateMaterialStockMovementDto) // TODO: Criar e importar o DTO apropriado
  stockMovements?: MaterialWarehouseStockRelationOnly['stockMovements'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateMaterialWarehouseStockDto extends IntersectionType(
  PartialType(MaterialWarehouseStockBaseDto),
  PickType(MaterialWarehouseStockBaseDto, [
    'warehouseId',
    'materialId'
  ] as const)
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateMaterialWarehouseStockDto extends PartialType(
  CreateMaterialWarehouseStockDto
) {}
