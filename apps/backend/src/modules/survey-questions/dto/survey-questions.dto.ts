import {
  ApiProperty,
  IntersectionType,
  PartialType,
  PickType
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma, SurveyQuestion, SurveyQuestionType } from '@sisman/prisma';
import { SurveyAnswerWithRelationsResponseDto } from '../../survey-answers/dto/survey-answers.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base para as perguntas da pesquisa.
 * @hidden
 */
class SurveyQuestionBaseDto implements SurveyQuestion {
  /**
   * ID único da pergunta da pesquisa.
   * @example "q_cln28u3vj00003b6w5q1p4s7b"
   */
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  id: string;

  /**
   * O enunciado da pergunta.
   * @example "Qual o seu nível de satisfação com nosso atendimento?"
   */
  @IsNotEmpty()
  @IsString()
  text: string;

  /**
   * Ordem da pergunta na sequência da pesquisa.
   * @example 1
   */
  @IsNotEmpty()
  @IsNumber()
  order: number;

  /**
   * Tipo de resposta esperada para a pergunta.
   * @example "RATING"
   */
  @IsEnum(SurveyQuestionType)
  @IsNotEmpty()
  type: SurveyQuestionType;

  /**
   * Indica se a resposta a esta pergunta é obrigatória.
   * @example true
   */
  @IsBoolean()
  required: boolean;

  /**
   * ID da pesquisa à qual esta pergunta pertence.
   * @example "cln28u3vj00003b6w5q1p4s7a"
   */
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  surveyId: string;

  /**
   * Data de criação da pergunta.
   * @example "2023-10-27T10:00:00.000Z"
   */
  @IsDate()
  createdAt: Date;

  /**
   * Data da última atualização da pergunta.
   * @example "2023-11-05T15:00:00.000Z"
   */
  @IsDate()
  updatedAt: Date;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const SurveyQuestionRelationOnlyArgs =
  Prisma.validator<Prisma.SurveyQuestionDefaultArgs>()({
    include: {
      answers: true,
      surveyQuestionOptions: true
    }
  });

type SurveyQuestionRelationsOnly = Prisma.SurveyQuestionGetPayload<
  typeof SurveyQuestionRelationOnlyArgs
>;

/**
 * DTO para representar a pergunta completa, incluindo suas relações.
 */
export class SurveyQuestionWithRelationsResponseDto
  extends SurveyQuestionBaseDto
  implements Partial<SurveyQuestionRelationsOnly>
{
  /**
   * Respostas associadas a esta pergunta.
   */
  @ApiProperty({
    type: () => SurveyAnswerWithRelationsResponseDto,
    isArray: true
  })
  @ValidateNested({ each: true })
  @Type(() => SurveyAnswerWithRelationsResponseDto)
  answers?: SurveyQuestionRelationsOnly['answers'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateSurveyQuestionDto extends IntersectionType(
  PartialType(SurveyQuestionBaseDto),
  PickType(SurveyQuestionBaseDto, [
    'text',
    'order',
    'type',
    'required',
    'surveyId'
  ] as const)
) {
  /**
   * Opções de resposta para perguntas do tipo MULTIPLE_CHOICE ou SINGLE_CHOICE.
   */
  @ApiProperty({
    type: () => CreateSurveyQuestionOptionsDto,
    isArray: true,
    required: false
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyQuestionOptionsDto)
  surveyQuestionOptions?: CreateSurveyQuestionOptionsDto[];
}

export class CreateSurveyQuestionOptionsDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;
}

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateSurveyQuestionDto extends PartialType(
  CreateSurveyQuestionDto
) {}
