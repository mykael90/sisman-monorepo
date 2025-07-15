import { OmitType, PartialType } from '@nestjs/swagger';
import { InfrastructureSpaceType, Prisma } from '@sisman/prisma';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsDate
} from 'class-validator';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// =================================================================

/**
 * Classe base.
 * @hidden
 */
class InfrastructureSpaceTypeBaseDto implements InfrastructureSpaceType {
  /**
   * ID do tipo de espaço de infraestrutura.
   * @example 1
   */
  @IsNumber()
  id: number;
  /**
   * Nome do tipo de espaço de infraestrutura.
   * @example "Sala de Aula"
   */
  @IsString()
  @IsNotEmpty()
  name: string;
  /**
   * Descrição do tipo de espaço de infraestrutura.
   * @example "Espaço destinado a atividades de ensino."
   */
  @IsString()
  description: string;
  /**
   * Data de criação do registro.
   */
  @IsDate()
  createdAt: Date;
  /**
   * Data da última atualização do registro.
   */
  @IsDate()
  updatedAt: Date;
  /**
   * Indica se o tipo de espaço está ativo.
   */
  @IsBoolean()
  isActive: boolean;
  /**
   * Ícone associado ao tipo de espaço.
   */
  @IsString()
  icon: string;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const InfrastructureSpaceTypeRelationOnlyArgs =
  Prisma.validator<Prisma.InfrastructureSpaceTypeDefaultArgs>()({
    select: {
      spaces: true
    }
  });

type InfrastructureSpaceTypeRelationsOnly =
  Prisma.InfrastructureSpaceTypeGetPayload<
    typeof InfrastructureSpaceTypeRelationOnlyArgs
  >;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class InfrastructureSpaceTypeWithRelationsResponseDto
  extends InfrastructureSpaceTypeBaseDto
  implements Partial<InfrastructureSpaceTypeRelationsOnly>
{
  /**
   * Lista de espaços associados a este tipo de espaço.
   */
  @IsOptional()
  spaces?: InfrastructureSpaceTypeRelationsOnly['spaces'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================
export class CreateInfrastructureSpaceTypeDto extends OmitType(
  InfrastructureSpaceTypeBaseDto,
  ['id', 'createdAt', 'updatedAt'] as const
) {
  /**
   * ID único do tipo de espaço de infraestrutura.
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  id?: number;
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateInfrastructureSpaceTypeDto extends PartialType(
  CreateInfrastructureSpaceTypeDto
) {}
