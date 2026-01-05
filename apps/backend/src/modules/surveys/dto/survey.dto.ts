import {
  ApiProperty,
  IntersectionType,
  PartialType,
  PickType
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma, Survey } from '@sisman/prisma';
import { CreateSurveyQuestionDto } from '../../survey-questions/dto/survey-questions.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base.
 * @hidden
 */

class SurveyBaseDto implements Survey {
  /**
   * ID único da pesquisa.
   * @example "cln28u3vj00003b6w5q1p4s7a"
   */
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  id: string;

  /**
   * Título da pesquisa.
   * @example "Pesquisa de Satisfação do Cliente"
   */
  @IsNotEmpty()
  @IsString()
  title: string;

  /**
   * Descrição detalhada da pesquisa.
   * @example "Uma pesquisa para coletar feedback sobre a experiência do cliente com nossos serviços."
   */
  @IsOptional()
  @IsString()
  description: string;

  /**
   * Indica se a pesquisa está ativa.
   * @example true
   */
  @IsBoolean()
  isActive: boolean;

  /**
   * Indica se a pesquisa deve ser exibida como modal na pagina inicial.
   * @example true
   */
  @IsBoolean()
  showModal: boolean;

  /**
   * Data de criação da pesquisa.
   * @example "2023-10-27T10:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  /**
   * Data da última atualização da pesquisa.
   * @example "2023-11-05T15:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const SurveyRelationOnlyArgs = Prisma.validator<Prisma.SurveyDefaultArgs>()({
  include: {
    questions: true,
    responses: true
  }
});

type SurveyRelationsOnly = Prisma.SurveyGetPayload<
  typeof SurveyRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */

export class SurveyWithRelationsResponseDto
  extends SurveyBaseDto
  implements Partial<SurveyRelationsOnly>
{
  /**
   * Questões vinculadas
   */
  @IsOptional()
  questions?: SurveyRelationsOnly['questions'];

  /**
   * Respostas vinculadas.
   */
  @IsOptional()
  responses?: SurveyRelationsOnly['responses'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateSurveyDto extends IntersectionType(
  PartialType(SurveyBaseDto),
  PickType(SurveyBaseDto, ['title'] as const)
) {}

export class CreateSurveyWithRelationsDto extends CreateSurveyDto {
  /**
   * Questões do levantamento.
   */
  @ApiProperty({ type: () => CreateSurveyQuestionDto, isArray: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyQuestionDto)
  questions?: CreateSurveyQuestionDto[];
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {}
