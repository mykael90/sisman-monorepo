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
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma, SurveyAnswer } from '@sisman/prisma';
import { SurveyQuestionWithRelationsResponseDto } from '../../survey-questions/dto/survey-questions.dto';
import { SurveyResponseWithRelationsResponseDto } from '../../survey-responses/dto/survey-responses.dto';

// =================================================================
// 1. "SUPER CLASSES" DE RESPOSTA (FONTE DA VERDADE)
// Contêm o contrato com o Prisma (`implements`) e os decoradores de validação.
// São a base para todas as outras DTOs.
// ===============================================================

/**
 * Classe base para as respostas da pesquisa.
 * @hidden
 */
class SurveyAnswerBaseDto implements SurveyAnswer {
  /**
   * ID único da resposta da pesquisa.
   * @example "ans_cln28u3vj00003b6w5q1p4s7a"
   */
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  id: string;

  /**
   * Valor inteiro da resposta, se aplicável.
   * @example 10
   */
  @IsOptional()
  @IsNumber()
  intValue: number;

  /**
   * Valor textual da resposta, se aplicável.
   * @example "Texto da resposta aqui."
   */
  @IsOptional()
  @IsString()
  stringValue: string;

  /**
   * Valor booleano da resposta, se aplicável.
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  boolValue: boolean;

  /**
   * ID da pergunta da pesquisa associada a esta resposta.
   * @example "q_cln28u3vj00003b6w5q1p4s7b"
   */
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  questionId: string;

  /**
   * ID da resposta geral da pesquisa à qual esta resposta individual pertence.
   * @example "res_cln28u3vj00003b6w5q1p4s7c"
   */
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  responseId: string;

  /**
   * Data de criação da resposta.
   * @example "2023-10-27T10:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  /**
   * Data da última atualização da resposta.
   * @example "2023-11-05T15:00:00.000Z"
   */
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

// =================================================================
// 2. DTOs DE RESPOSTA (Públicas) - Adicionam as relações aninhadas
// =================================================================

const SurveyAnswerRelationOnlyArgs =
  Prisma.validator<Prisma.SurveyAnswerDefaultArgs>()({
    include: {
      question: true,
      response: true,
      options: true
    }
  });

type SurveyAnswerRelationsOnly = Prisma.SurveyAnswerGetPayload<
  typeof SurveyAnswerRelationOnlyArgs
>;

/**
 * DTO para representar a resposta completa, incluindo suas relações.
 */
export class SurveyAnswerWithRelationsResponseDto
  extends SurveyAnswerBaseDto
  implements Partial<SurveyAnswerRelationsOnly>
{
  @ApiProperty({ type: () => SurveyQuestionWithRelationsResponseDto })
  question?: SurveyAnswerRelationsOnly['question'];

  @ApiProperty({ type: () => SurveyResponseWithRelationsResponseDto })
  response?: SurveyAnswerRelationsOnly['response'];

  @ApiProperty({ type: () => SurveyResponseWithRelationsResponseDto })
  options?: SurveyAnswerRelationsOnly['options'];
}

// =================================================================
// 3. DTOs DE CRIAÇÃO (INPUT) - Derivadas com OmitType
// =================================================================

export class CreateSurveyAnswerDto extends IntersectionType(
  PartialType(SurveyAnswerBaseDto),
  PickType(SurveyAnswerBaseDto, ['questionId'] as const)
) {
  @ApiProperty({
    oneOf: [
      { type: 'string' },
      { type: 'number' },
      { type: 'boolean' },
      {
        type: 'array',
        items: { type: 'string' }
      }
    ]
  })
  @IsOptional()
  // @IsString({ each: true })
  // @IsNumber({}, { each: true })
  // @IsBoolean({ each: true })
  value?: string | number | boolean | string[];

  // /**
  //  * Respostas individuais das perguntas do levantamento.
  //  */
  // @ApiProperty({ type: () => CreateSurveyAnswerOptionDto, isArray: true })
  // @ValidateNested({ each: true })
  // @Type(() => CreateSurveyAnswerOptionDto)
  // options?: CreateSurveyAnswerOptionDto[];
}

// export class CreateSurveyAnswerOptionDto {
//   @IsUUID()
//   @IsNotEmpty()
//   @IsString()
//   optionId: string;
// }

// =================================================================
// 4. DTOs DE ATUALIZAÇÃO (INPUT) - Derivadas com PartialType
// =================================================================

export class UpdateSurveyAnswerDto extends PartialType(CreateSurveyAnswerDto) {}
