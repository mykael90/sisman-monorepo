import { PartialType } from '@nestjs/swagger';
import { WorkerManualFrequencyType } from '@sisman/prisma';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */

class WorkerManualFrequencyTypeBaseDto implements WorkerManualFrequencyType {
  id: number;
  type: string;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

export class WorkerManualFrequencyTypeRelationsResponseDto extends WorkerManualFrequencyTypeBaseDto {}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class WorkerManualFrequencyTypeCreateDto extends PartialType(
  WorkerManualFrequencyTypeBaseDto
) {
  type: string;
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class WorkerManualFrequencyTypeUpdateDto extends PartialType(
  WorkerManualFrequencyTypeCreateDto
) {}

// ==================================================
