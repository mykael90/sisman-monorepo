import {
  $Enums,
  MaterialStockMovementType,
  Prisma,
  MaterialStockOperationSubType
} from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { MaterialStockMovementWithRelationsResponseDto } from '../../material-stock-movements/dto/material-stock-movements.dto';
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

class MaterialStockMovementTypeBaseDto implements MaterialStockMovementType {
  /**
   * ID único do tipo de movimentação de estoque.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  id: number;

  /**
   * Nome do tipo de movimentação.
   * @example "Entrada por Compra"
   */
  @IsString()
  @IsNotEmpty()
  name: MaterialStockOperationSubType;

  /**
   * Código único para o tipo de movimentação.
   * @example "ENT-COMP"
   */
  @IsEnum($Enums.MaterialStockOperationSubType)
  @IsString()
  @IsNotEmpty()
  code: MaterialStockOperationSubType;

  /**
   * Descrição detalhada do tipo de movimentação.
   * @example "Movimentação de entrada de material adquirido por processo de compra."
   */
  @IsString()
  @IsOptional()
  description: string;

  /**
   * Tipo de operação de estoque (entrada ou saída).
   * @example "IN"
   */
  @IsEnum($Enums.MaterialStockOperationType)
  @IsNotEmpty()
  operation: $Enums.MaterialStockOperationType;

  /**
   * Indica se o tipo de movimentação está ativo.
   * @example true
   */
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

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
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const MaterialStockMovementTypeRelationOnlyArgs =
  Prisma.validator<Prisma.MaterialStockMovementTypeDefaultArgs>()({
    select: {
      stockMovements: true,
      materialWithdrawals: true,
      materialReceipts: true
    }
  });

type MaterialStockMovementTypeRelationOnly =
  Prisma.MaterialStockMovementTypeGetPayload<
    typeof MaterialStockMovementTypeRelationOnlyArgs
  >;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class MaterialStockMovementTypeWithRelationsResponseDto
  extends MaterialStockMovementTypeBaseDto
  implements Partial<MaterialStockMovementTypeRelationOnly>
{
  /**
   * Movimentações de estoque associadas a este tipo.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialStockMovementWithRelationsResponseDto)
  stockMovements?: MaterialStockMovementTypeRelationOnly['stockMovements'];

  /**
   * Retiradas de material associadas a este tipo.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  // @Type(() => MaterialWithdrawalDto) // TODO: Criar e importar o DTO apropriado
  materialWithdrawals?: MaterialStockMovementTypeRelationOnly['materialWithdrawals'];

  /**
   * Recebimentos de material associados a este tipo.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  // @Type(() => MaterialReceiptDto) // TODO: Criar e importar o DTO apropriado
  materialReceipts?: MaterialStockMovementTypeRelationOnly['materialReceipts'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateMaterialStockMovementTypeDto extends IntersectionType(
  PartialType(MaterialStockMovementTypeBaseDto),
  PickType(MaterialStockMovementTypeBaseDto, [
    'name',
    'code',
    'operation'
  ] as const)
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateMaterialStockMovementTypeDto extends PartialType(
  CreateMaterialStockMovementTypeDto
) {}
