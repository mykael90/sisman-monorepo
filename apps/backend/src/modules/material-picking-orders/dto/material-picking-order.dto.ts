import { PickType } from '@nestjs/mapped-types';
import { IntersectionType, PartialType } from '@nestjs/swagger';
import {
  $Enums,
  MaterialPickingOrder,
  MaterialPickingOrderItem,
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
import { UpdateWarehouseDto } from '../../warehouses/dto/warehouse.dto';
import { UpdateUserDto } from '../../users/dto/user.dto'; // Assuming UpdateUserDto exists

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */
class MaterialPickingOrderBaseDto implements MaterialPickingOrder {
  /**
   * ID único da ordem de separação de material.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  id: number;

  /**
   * Número da ordem de separação.
   * @example "PICK-001234"
   */
  @IsString()
  @IsNotEmpty()
  pickingOrderNumber: string;

  /**
   * ID da requisição de material associada, se houver.
   * @example 123
   */
  @IsOptional()
  @IsNumber()
  materialRequestId: number;

  /**
   * ID da requisição de manutenção associada, se houver.
   * @example 456
   */
  @IsOptional()
  @IsNumber()
  maintenanceRequestId: number;

  /**
   * ID do almoxarifado onde a separação ocorrerá.
   * @example 2
   */
  @IsNumber()
  @IsNotEmpty()
  warehouseId: number;

  /**
   * ID do usuário que solicitou a separação.
   * @example 10
   */
  @IsNumber()
  @IsNotEmpty()
  requestedByUserId: number;

  /**
   * Data e hora em que a ordem de separação foi solicitada.
   * @example "2024-07-25T14:00:00.000Z"
   */
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  requestedAt: Date;

  /**
   * ID do usuário que efetivamente coletará os materiais.
   * @example 11
   */
  @IsOptional()
  @IsNumber()
  beCollectedByUserId: number;

  /**
   * ID do trabalhador que efetivamente coletará os materiais.
   * @example 12
   */
  @IsOptional()
  @IsNumber()
  beCollectedByWorkerId: number;

  /**
   * Data desejada para retirada dos materiais.
   * @example "2024-07-26T09:00:00.000Z"
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  desiredPickupDate: Date;

  /**
   * Status atual da ordem de separação.
   * @example "PENDING_PREPARATION"
   */
  @IsEnum($Enums.MaterialPickingOrderStatus)
  @IsNotEmpty()
  status: $Enums.MaterialPickingOrderStatus;

  /**
   * Observações adicionais sobre a ordem de separação.
   * @example "Materiais para a OS 123, urgência média."
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

class MaterialPickingOrderItemBaseDto implements MaterialPickingOrderItem {
  globalMaterialId: string;
  materialInstanceId: number;
  notes: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  materialPickingOrderId: number;
  materialRequestItemId: number;
  quantityToPick: Prisma.Decimal;
  quantityPicked: Prisma.Decimal;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const MaterialPickingOrderRelationOnlyArgs =
  Prisma.validator<Prisma.MaterialPickingOrderDefaultArgs>()({
    include: {
      warehouse: true,
      materialRequest: true,
      maintenanceRequest: true,
      requestedByUser: true,
      beCollectedByUser: true,
      beCollectedByWorker: true,
      items: true
    }
  });

type MaterialPickingOrderRelationOnly = Prisma.MaterialPickingOrderGetPayload<
  typeof MaterialPickingOrderRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class MaterialPickingOrderWithRelationsResponseDto
  extends MaterialPickingOrderBaseDto
  implements Partial<MaterialPickingOrderRelationOnly>
{
  /**
   * Dados do almoxarifado onde a separação ocorrerá.
   * @example { "id": 1, "name": "Almoxarifado Central" }
   */
  @ValidateNested()
  @Type(() => UpdateWarehouseDto)
  warehouse: MaterialPickingOrderRelationOnly['warehouse'];

  /**
   * Dados da requisição de material associada, se houver.
   */
  @IsOptional()
  @ValidateNested()
  materialRequest?: MaterialPickingOrderRelationOnly['materialRequest'];

  /**
   * Dados da requisição de manutenção associada, se houver.
   */
  @IsOptional()
  @ValidateNested()
  maintenanceRequest?: MaterialPickingOrderRelationOnly['maintenanceRequest'];

  /**
   * Dados do usuário que solicitou a separação.
   */
  @ValidateNested()
  @Type(() => UpdateUserDto)
  requestedByUser: MaterialPickingOrderRelationOnly['requestedByUser'];

  /**
   * Dados do usuário que efetivamente coletará os materiais.
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserDto)
  beCollectedByUser?: MaterialPickingOrderRelationOnly['beCollectedByUser'];

  /**
   * Dados do trabalhador que efetivamente coletará os materiais.
   */
  @IsOptional()
  // @ValidateNested()
  // @Type(() => UpdateWorkerDto)
  beCollectedByWorker?: MaterialPickingOrderRelationOnly['beCollectedByWorker'];

  @IsDefined()
  @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => MaterialPickingOrderItemResponseDto)
  items: MaterialPickingOrderRelationOnly['items'];
}

// export class MaterialPickingOrderItemResponseDto extends MaterialPickingOrderItemBaseDto {
//   @IsOptional()
//   materialRequestItem?: MaterialPickingOrderRelationOnly['items'][number]['materialRequestItem'];
// }

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateMaterialPickingOrderDto extends IntersectionType(
  PartialType(MaterialPickingOrderBaseDto),
  PickType(MaterialPickingOrderBaseDto, ['requestedAt'] as const)
) {}

export class CreateMaterialPickingOrderWithRelationsDto extends IntersectionType(
  PartialType(MaterialPickingOrderBaseDto),
  PickType(MaterialPickingOrderBaseDto, ['requestedAt'] as const)
) {
  /**
   * Dados do almoxarifado onde a separação ocorrerá.
   * @example { "id": 1, "name": "Almoxarifado Central" }
   */
  @IsDefined()
  @ValidateNested()
  @Type(() => UpdateWarehouseDto)
  warehouse: MaterialPickingOrderRelationOnly['warehouse'];

  /**
   * Dados da requisição de material associada, se houver.
   */
  @IsOptional()
  materialRequest?: MaterialPickingOrderRelationOnly['materialRequest'];

  /**
   * Dados da requisição de manutenção associada, se houver.
   */
  @IsOptional()
  maintenanceRequest?: MaterialPickingOrderRelationOnly['maintenanceRequest'];

  /**
   * Dados do usuário que solicitou a separação.
   * @example { "id": 1, "name": "João Silva" }
   */
  @IsDefined()
  requestedByUser: MaterialPickingOrderRelationOnly['requestedByUser'];

  /**
   * Dados do usuário que efetivamente coletará os materiais.
   */
  @IsOptional()
  beCollectedByUser?: MaterialPickingOrderRelationOnly['beCollectedByUser'];

  /**
   * Dados do trabalhador que efetivamente coletará os materiais.
   */
  @IsOptional()
  beCollectedByWorker?: MaterialPickingOrderRelationOnly['beCollectedByWorker'];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialPickingOrderItemDto)
  items?: MaterialPickingOrderRelationOnly['items'];
}

export class CreateMaterialPickingOrderItemDto extends IntersectionType(
  PartialType(MaterialPickingOrderItemBaseDto),
  PickType(MaterialPickingOrderItemBaseDto, [
    'quantityToPick',
    'materialRequestItemId'
  ] as const)
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateMaterialPickingOrderDto extends PartialType(
  CreateMaterialPickingOrderDto
) {}

export class UpdateMaterialPickingOrderWithRelationsDto extends PartialType(
  CreateMaterialPickingOrderWithRelationsDto
) {}

export class UpdateMaterialPickingOrderItemDto extends PartialType(
  CreateMaterialPickingOrderItemDto
) {}
