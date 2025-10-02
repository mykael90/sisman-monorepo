import { PartialType, PickType } from '@nestjs/swagger';
import { WorkerManualFrequencyType } from '@sisman/prisma';
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

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
  /**
   * ID único do tipo de frequência manual.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  id: number;

  /**
   * Nome do tipo de frequência manual.
   * @example 'Normal'
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  type: string;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

export class WorkerManualFrequencyTypeRelationsResponseDto extends WorkerManualFrequencyTypeBaseDto {}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class WorkerManualFrequencyTypeCreateDto extends PickType(
  WorkerManualFrequencyTypeBaseDto,
  ['type'] as const
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class WorkerManualFrequencyTypeUpdateDto extends PartialType(
  WorkerManualFrequencyTypeCreateDto
) {}

// ==================================================
