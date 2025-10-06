import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType
} from '@nestjs/swagger';
import { WorkerManualFrequencyType } from '@sisman/prisma';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength
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
class WorkerManualFrequencyTypeBaseDto implements WorkerManualFrequencyType {
  /**
   * Tipo de frequência manual.
   * @example 'Diário'
   */
  @IsString()
  @IsNotEmpty()
  type: string;

  /**
   * Nome do tipo de frequência manual do trabalhador.
   * @example 'Diário'
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  /**
   * ID único do tipo de frequência manual.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * Descrição detalhada do tipo de frequência manual.
   * @example 'Frequência manual diária para registro de ponto.'
   */
  @IsString()
  @IsOptional()
  description: string | null;

  /**
   * Data de criação do registro.
   * @example '2023-10-27T10:00:00.000Z'
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data da última atualização do registro.
   * @example '2023-10-27T12:00:00.000Z'
   */
  @IsDate()
  updatedAt: Date;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class WorkerManualFrequencyTypeWithRelationsResponseDto extends WorkerManualFrequencyTypeBaseDto {}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class WorkerManualFrequencyTypeCreateDto extends IntersectionType(
  PartialType(WorkerManualFrequencyTypeBaseDto),
  PickType(WorkerManualFrequencyTypeBaseDto, ['name', 'type'] as const)
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class WorkerManualFrequencyTypeUpdateDto extends PartialType(
  WorkerManualFrequencyTypeCreateDto
) {}
