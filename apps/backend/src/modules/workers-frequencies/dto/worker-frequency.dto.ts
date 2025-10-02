import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Prisma, WorkerManualFrequency } from '@sisman/prisma';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */

class WorkerManualFrequencyBaseDto implements WorkerManualFrequency {
  workerId: number;
  date: Date;
  hours: number;
  workerManualFrequencyTypeId: number;
  notes: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

export class WorkerManualFrequencyRelationsResponseDto extends WorkerManualFrequencyBaseDto {}

const WorkerManualFrequencyRelationOnlyArgs =
  Prisma.validator<Prisma.WorkerManualFrequencyDefaultArgs>()({
    include: {
      worker: true,
      workerManualFrequencyType: true,
      user: true
    }
  });

type WorkerManualFrequencyRelationsOnly =
  Prisma.WorkerManualFrequencyGetPayload<
    typeof WorkerManualFrequencyRelationOnlyArgs
  >;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class WorkerManualFrequencyWithRelationsResponseDto
  extends WorkerManualFrequencyBaseDto
  implements Partial<WorkerManualFrequencyRelationsOnly>
{
  worker?: WorkerManualFrequencyRelationsOnly['worker'];
  workerManualFrequencyType?: WorkerManualFrequencyRelationsOnly['workerManualFrequencyType'];
  user?: WorkerManualFrequencyRelationsOnly['user'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class WorkerManualFrequencyCreateDto extends IntersectionType(
  PartialType(WorkerManualFrequencyBaseDto),
  PickType(WorkerManualFrequencyBaseDto, [
    'workerId',
    'date',
    'hours',
    'workerManualFrequencyTypeId',
    'userId'
  ] as const)
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class WorkerManualFrequencyUpdateDto extends PartialType(
  WorkerManualFrequencyCreateDto
) {}

// ==================================================
