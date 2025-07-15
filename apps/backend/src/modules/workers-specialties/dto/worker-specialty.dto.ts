import { OmitType } from '@nestjs/mapped-types';
import { Prisma, WorkerSpecialty } from '@sisman/prisma';
import {
  IsArray,
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

class WorkerSpecialtyBaseDto implements WorkerSpecialty {
  /**
   * Nome da especialidade do trabalhador.
   * @example 'Eletricista'
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  /**
   * ID único da especialidade.
   * @example 1
   */
  @IsNumber()
  id: number;

  /**
   * Descrição detalhada da especialidade.
   * @example 'Especialista em instalações elétricas prediais e de baixa tensão.'
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

const WorkerSpecialtyRelationOnlyArgs =
  Prisma.validator<Prisma.WorkerSpecialtyDefaultArgs>()({
    select: {
      teams: true
    }
  });

type WorkerSpecialtyRelationsOnly = Prisma.WorkerSpecialtyGetPayload<
  typeof WorkerSpecialtyRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class WorkerSpecialtyWithRelationsResponseDto
  extends WorkerSpecialtyBaseDto
  implements Partial<WorkerSpecialtyRelationsOnly>
{
  /**
   * Lista de equipes associadas a esta especialidade.
   */
  @IsArray()
  @IsOptional()
  teams?: WorkerSpecialtyRelationsOnly['teams'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class WorkerSpecialtyCreateDto extends OmitType(WorkerSpecialtyBaseDto, [
  'id',
  'createdAt',
  'updatedAt'
] as const) {
  /**
   * ID único da especialidade.
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  id?: number;
}
