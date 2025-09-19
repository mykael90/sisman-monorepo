import { PickType } from '@nestjs/mapped-types';
import { IntersectionType, PartialType } from '@nestjs/swagger';
import { $Enums, MaterialReceipt, Prisma } from '@sisman/prisma';
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
import { UpdateWarehouseDto } from '../../warehouses/dto/warehouse.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */
class MaterialReceiptBaseDto implements MaterialReceipt {
  /**
   * ID da retirada de material associada, se houver.
   * @example 123
   */
  @IsOptional()
  @IsNumber()
  materialWithdrawalId: number;

  /**
   * ID da requisição de material associada, se houver.
   * @example 123
   */
  @IsOptional()
  @IsNumber()
  materialRequestId: number;

  /**
   * ID único do recebimento de material.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  id: number;

  /**
   * Número do recebimento (ex: nota fiscal, romaneio).
   * @example "NF-001234"
   */
  @IsString()
  @IsNotEmpty()
  receiptNumber: string;

  /**
   * Referência externa, como um número de pedido de compra.
   * @example "PC-2024-05-001"
   */
  @IsOptional()
  @IsString()
  externalReference: string;

  /**
   * Data em que o recebimento ocorreu.
   * @example "2024-07-25T14:00:00.000Z"
   */
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  receiptDate: Date;

  /**
   * ID do tipo de movimento de estoque (ex: Entrada por Compra).
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  movementTypeId: number;

  /**
   * Nome da origem do material (ex: Fornecedor).
   * @example "Fornecedor XYZ Ltda."
   */
  @IsOptional()
  @IsString()
  sourceName: string;

  /**
   * ID do almoxarifado de destino.
   * @example 2
   */
  @IsNumber()
  @IsNotEmpty()
  destinationWarehouseId: number;

  /**
   * ID do usuário que processou o recebimento.
   * @example 10
   */
  @IsNumber()
  @IsNotEmpty()
  processedByUserId: number;

  /**
   * Status atual do recebimento.
   * @example "COMPLETED"
   */
  @IsEnum($Enums.MaterialReceiptStatus)
  @IsNotEmpty()
  status: $Enums.MaterialReceiptStatus;

  /**
   * Observações adicionais sobre o recebimento.
   * @example "Recebimento parcial do pedido PC-2024-05-001."
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

  /**
   * Valor total da entrada.
   * @example 234.65
   */
  @IsOptional()
  @IsNumber()
  valueReceipt: Prisma.Decimal;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const MaterialReceiptRelationOnlyArgs =
  Prisma.validator<Prisma.MaterialReceiptDefaultArgs>()({
    include: {
      movementType: true,
      destinationWarehouse: true,
      processedByUser: true,
      items: true,
      materialRequest: true,
      materialWithdrawal: true
    }
  });

type MaterialReceiptRelationOnly = Prisma.MaterialReceiptGetPayload<
  typeof MaterialReceiptRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class MaterialReceiptWithRelationsResponseDto
  extends MaterialReceiptBaseDto
  implements Partial<MaterialReceiptRelationOnly>
{
  /**
   * Dados do tipo de movimentação de estoque.
   * @example { "id": 1, "description": "Entrada por Compra" }
   */
  @ValidateNested()
  // @Type(() => MovementTypeDto) // TODO: Criar e importar o DTO apropriado
  movementType: MaterialReceiptRelationOnly['movementType'];

  /**
   * Dados do almoxarifado onde a movimentação ocorreu.
   * @example { "id": 1, "name": "Almoxarifado Central" }
   */
  //   @IsOptional()
  @ValidateNested()
  @Type(() => UpdateWarehouseDto)
  destinationWarehouse: MaterialReceiptRelationOnly['destinationWarehouse'];

  /**
   * Dados do usuário que processou a movimentação.
   * @example { "id": 1, "name": "João Silva" }
   */
  //   @IsOptional()
  @ValidateNested()
  processedByUser: MaterialReceiptRelationOnly['processedByUser'];

  @IsDefined()
  @IsArray()
  items: MaterialReceiptRelationOnly['items'];

  @IsOptional()
  materialRequest?: MaterialReceiptRelationOnly['materialRequest'];

  @IsOptional()
  materialWithdrawal?: MaterialReceiptRelationOnly['materialWithdrawal'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateMaterialReceiptDto extends IntersectionType(
  PartialType(MaterialReceiptBaseDto),
  PickType(MaterialReceiptBaseDto, ['receiptDate'] as const)
) {}

export class CreateMaterialReceiptWithRelationsDto extends IntersectionType(
  PartialType(MaterialReceiptBaseDto),
  PickType(MaterialReceiptBaseDto, ['receiptDate'] as const)
) {
  /**
   * Dados do tipo de movimentação de estoque.
   * @example { "id": 1, "description": "Entrada por Compra" }
   */
  // @ValidateNested()
  @IsDefined()
  // @Type(() => MovementTypeDto) // TODO: Criar e importar o DTO apropriado
  movementType: MaterialReceiptRelationOnly['movementType'];

  /**
   * Dados do almoxarifado onde a movimentação ocorreu.
   * @example { "id": 1, "name": "Almoxarifado Central" }
   */
  // @IsOptional()
  @ValidateNested()
  @Type(() => UpdateWarehouseDto)
  destinationWarehouse?: MaterialReceiptRelationOnly['destinationWarehouse'];

  /**
   * Dados do usuário que processou a movimentação.
   * @example { "id": 1, "name": "João Silva" }
   */
  @IsDefined()
  // @ValidateNested()
  // @Type(() => UserDto) // TODO: Criar e importar o DTO apropriado
  processedByUser: MaterialReceiptRelationOnly['processedByUser'];

  @IsDefined()
  items: MaterialReceiptRelationOnly['items'];

  @IsOptional()
  materialRequest: MaterialReceiptRelationOnly['materialRequest'];

  @IsOptional()
  materialWithdrawal: MaterialReceiptRelationOnly['materialWithdrawal'];
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateMaterialReceiptDto extends PartialType(
  CreateMaterialReceiptDto
) {}

export class UpdateMaterialReceiptWithRelationsDto extends PartialType(
  CreateMaterialReceiptWithRelationsDto
) {}
