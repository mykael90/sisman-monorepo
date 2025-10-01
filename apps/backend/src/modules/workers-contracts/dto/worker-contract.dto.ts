import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Prisma, WorkerContract } from '@sisman/prisma';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */

class WorkerContractBaseDto implements WorkerContract {
  /**
   * ID único do vínculo do trabalhador com o contrato.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * ID do trabalhador.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  workerId: number;

  /**
   * ID do contrato.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  contractId: number;

  /**
   * ID da especialidade do trabalhador.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  workerSpecialtyId: number;

  /**
   * ID da unidade de lotação do SIPAC.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  sipacUnitLocationId: number;

  /**
   * Data de início do vínculo.
   * @example '2023-01-01T00:00:00.000Z'
   */
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  /**
   * Data de término do vínculo.
   * @example '2024-01-01T00:00:00.000Z'
   */
  @IsDate()
  endDate: Date;

  /**
   * Observações sobre o vínculo.
   * @example 'Período de experiência.'
   */
  @IsString()
  notes: string;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

export class WorkerContractResponseDto extends WorkerContractBaseDto {}

const WorkerContractRelationOnlyArgs =
  Prisma.validator<Prisma.WorkerContractDefaultArgs>()({
    include: {
      worker: true,
      contract: true,
      workerSpecialty: true,
      sipacUnitLocation: true
    }
  });

type WorkerContractRelationsOnly = Prisma.WorkerContractGetPayload<
  typeof WorkerContractRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class WorkerContractWithRelationsResponseDto
  extends WorkerContractBaseDto
  implements Partial<WorkerContractRelationsOnly>
{
  /**
   * Dados do trabalhador associado.
   */
  @IsOptional()
  worker?: WorkerContractRelationsOnly['worker'];

  /**
   * Dados do contrato associado.
   */
  @IsOptional()
  contract?: WorkerContractRelationsOnly['contract'];

  /**
   * Dados da especialidade do trabalhador.
   */
  @IsOptional()
  workerSpecialty?: WorkerContractRelationsOnly['workerSpecialty'];

  /**
   * Dados da unidade de lotação do SIPAC.
   */
  @IsOptional()
  sipacUnitLocation?: WorkerContractRelationsOnly['sipacUnitLocation'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class WorkerContractCreateDto extends IntersectionType(
  PartialType(WorkerContractBaseDto),
  PickType(WorkerContractBaseDto, [
    'workerId',
    'contractId',
    'workerSpecialtyId',
    'startDate'
  ] as const)
) {
  @IsOptional()
  @IsString()
  sipacUnitLocationCode?: string;
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class WorkerContractUpdateDto extends PartialType(
  WorkerContractCreateDto
) {
  @IsNumber()
  id: number;
}

// ==================================================
