import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma, SurveyResponse } from '@sisman/prisma';
import { SurveyAnswerWithRelationsResponseDto } from '../../survey-answers/dto/survey-answers.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base para as respostas da pesquisa.
 * @hidden
 */
class SurveyResponseBaseDto implements SurveyResponse {
  /**
   * ID único da resposta da pesquisa.
   * @example "res_cln28u3vj00003b6w5q1p4s7c"
   */
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  id: string;

  /**
   * Data em que a pesquisa foi concluída.
   * @example "2023-11-05T15:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  completedAt: Date;

  /**
   * ID do usuário que respondeu à pesquisa.
   * @example 1
   */
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  /**
   * ID da pesquisa à qual esta resposta pertence.
   * @example "cln28u3vj00003b6w5q1p4s7a"
   */
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  surveyId: string;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const SurveyResponseRelationOnlyArgs =
  Prisma.validator<Prisma.SurveyResponseDefaultArgs>()({
    include: {
      user: true,
      survey: true,
      answers: true
    }
  });

type SurveyResponseRelationsOnly = Prisma.SurveyResponseGetPayload<
  typeof SurveyResponseRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */
export class SurveyResponseWithRelationsResponseDto
  extends SurveyResponseBaseDto
  implements Partial<SurveyResponseRelationsOnly>
{
  // NOTE: Assuming User and Survey DTOs would be defined elsewhere.
  user?: any; // Placeholder for User DTO
  survey?: any; // Placeholder for Survey DTO

  /**
   * Respostas individuais para as perguntas da pesquisa.
   */
  @ValidateNested({ each: true })
  @Type(() => SurveyAnswerWithRelationsResponseDto)
  answers?: SurveyResponseRelationsOnly['answers'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateSurveyResponseDto extends IntersectionType(
  PartialType(SurveyResponseBaseDto),
  PickType(SurveyResponseBaseDto, ['userId', 'surveyId'] as const)
) {}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateSurveyResponseDto extends PartialType(
  CreateSurveyResponseDto
) {}
