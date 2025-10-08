import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Prisma, WorkerManualFrequency } from '@sisman/prisma';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';

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
  id: number;
  /**
   * ID do trabalhador associado à frequência manual.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  workerId: number;

  /**
   * Data da frequência manual.
   * @example '2023-10-27T10:00:00.000Z'
   */
  @IsDate()
  @IsNotEmpty()
  date: Date;

  /**
   * Número de horas registradas para a frequência manual.
   * @example 8
   */
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  hours: number;

  /**
   * ID do tipo de frequência manual do trabalhador.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  workerManualFrequencyTypeId: number;

  /**
   * ID do contrato do trabalhador.
   * @example 1
   */
  @IsNumber()
  @IsOptional()
  workerContractId: number;

  /**
   * Notas adicionais sobre a frequência manual.
   * @example 'Trabalho extra no projeto X.'
   */
  @IsString()
  @IsOptional()
  notes: string;

  /**
   * ID do usuário que registrou a frequência manual.
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  /**
   * Data de criação do registro.
   * @example '2023-10-27T10:00:00.000Z'
   */
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  /**
   * Data da última atualização do registro.
   * @example '2023-10-27T12:00:00.000Z'
   */
  @IsDate()
  @IsNotEmpty()
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
      user: true,
      workerContract: true
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
  /**
   * O trabalhador associado a esta frequência manual.
   */
  @IsOptional()
  worker?: WorkerManualFrequencyRelationsOnly['worker'];

  /**
   * O tipo de frequência manual do trabalhador.
   */
  @IsOptional()
  workerManualFrequencyType?: WorkerManualFrequencyRelationsOnly['workerManualFrequencyType'];

  /**
   * O usuário que registrou a frequência manual.
   */
  @IsOptional()
  user?: WorkerManualFrequencyRelationsOnly['user'];

  /**
   * O contrato do trabalhador.
   */
  @IsOptional()
  workerContract?: WorkerManualFrequencyRelationsOnly['workerContract'];
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
    'userId',
    'notes'
  ] as const)
) {}

export class WorkerManualFrequencyCreateManyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkerManualFrequencyCreateDto)
  items: WorkerManualFrequencyCreateDto[];
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class WorkerManualFrequencyUpdateDto extends PartialType(
  WorkerManualFrequencyCreateDto
) {}

// ==================================================
