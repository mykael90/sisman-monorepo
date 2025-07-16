// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

import { OmitType, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { InfrastructureBuildingActivity, Prisma } from '@sisman/prisma';

/**
 * Classe base.
 * @hidden
 */
class InfrastructureBuildingActivityBaseDto
  implements InfrastructureBuildingActivity
{
  /**
   * Identificador único da atividade de edificação.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * Nome da atividade de edificação.
   * @example "Ensino"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Descrição detalhada da atividade.
   * @example "Atividades relacionadas a salas de aula, laboratórios de ensino, bibliotecas, etc."
   */
  @IsString()
  @IsNotEmpty()
  description: string;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const InfrastructureBuildingActivityRelationOnlyArgs =
  Prisma.validator<Prisma.InfrastructureBuildingActivityDefaultArgs>()({
    select: {
      buldingsPrimary: true,
      buldingsSecondary: true,
      infrastructureBuildingType: true
    }
  });

type InfrastructureBuildingActivityRelationsOnly =
  Prisma.InfrastructureBuildingActivityGetPayload<
    typeof InfrastructureBuildingActivityRelationOnlyArgs
  >;

export class InfrastructureBuildingActivityResponseDto extends InfrastructureBuildingActivityBaseDto {}

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class InfrastructureBuildingActivityWithRelationsResponseDto
  extends InfrastructureBuildingActivityBaseDto
  implements Partial<InfrastructureBuildingActivityRelationsOnly>
{
  /**
   * Lista de edificações onde esta é a atividade principal.
   */
  @IsOptional()
  @IsArray()
  buldingsPrimary?: InfrastructureBuildingActivityRelationsOnly['buldingsPrimary'];

  /**
   * Lista de edificações onde esta é uma atividade secundária.
   */
  @IsOptional()
  @IsArray()
  buldingsSecondary?: InfrastructureBuildingActivityRelationsOnly['buldingsSecondary'];

  /**
   * O tipo de edificação associado a esta atividade.
   */
  @IsOptional()
  InfrastructureBuildingType?: InfrastructureBuildingActivityRelationsOnly['infrastructureBuildingType'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateInfrastructureBuildingActivityDto extends OmitType(
  InfrastructureBuildingActivityBaseDto,
  ['id'] as const
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateInfrastructureBuildingActivityDto extends PartialType(
  CreateInfrastructureBuildingActivityDto
) {}
