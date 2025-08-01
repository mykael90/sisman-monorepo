// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

import { PartialType, OmitType } from '@nestjs/swagger';
import { InfrastructureBuildingType, Prisma } from '@sisman/prisma';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * Classe base.
 * @hidden
 */

class InfrastructureBuildingTypeBaseDto implements InfrastructureBuildingType {
  /**
   * Identificador único do tipo de edificação.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * Nome do tipo de edificação.
   * @example "Edifício Administrativo"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Descrição detalhada do tipo de edificação.
   * @example "Prédios utilizados para fins administrativos e de escritórios."
   */
  @IsString()
  @IsNotEmpty()
  description: string;

  /**
   * ID da atividade de edificação de infraestrutura associada.
   * @example 1
   */
  @IsNumber()
  infrastructureBuildingActivityId: number;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const InfrastructureBuildingTypeRelationOnlyArgs =
  Prisma.validator<Prisma.InfrastructureBuildingTypeDefaultArgs>()({
    select: {
      infrastructureBuildingActivity: true
    }
  });

type InfrastructureBuildingTypeRelationsOnly =
  Prisma.InfrastructureBuildingTypeGetPayload<
    typeof InfrastructureBuildingTypeRelationOnlyArgs
  >;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class InfrastructureBuildingTypeWithRelationsResponseDto
  extends InfrastructureBuildingTypeBaseDto
  implements Partial<InfrastructureBuildingTypeRelationsOnly>
{
  /**
   * Atividade de edificação de infraestrutura associada.
   */
  @IsOptional()
  // TODO: Adicionar @ValidateNested e @Type quando o DTO de InfrastructureBuildingActivity for criado.
  infrastructureBuildingActivity?: InfrastructureBuildingTypeRelationsOnly['infrastructureBuildingActivity'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateInfrastructureBuildingTypeDto extends OmitType(
  InfrastructureBuildingTypeBaseDto,
  ['id'] as const
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateInfrastructureBuildingTypeDto extends PartialType(
  CreateInfrastructureBuildingTypeDto
) {}
