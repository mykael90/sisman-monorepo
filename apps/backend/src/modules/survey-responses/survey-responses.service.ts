import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { Prisma, SurveyQuestionType, SurveyResponse } from '@sisman/prisma';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import { CreateSurveyResponseDto } from './dto/survey-responses.dto';

@Injectable()
export class SurveyResponsesService {
  private readonly logger = new Logger(SurveyResponsesService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  private readonly includeRelations: Prisma.SurveyResponseInclude = {
    answers: {
      include: {
        options: true
      }
    }
  };

  async create(
    data: CreateSurveyResponseDto,
    tx?: Prisma.TransactionClient
  ): Promise<SurveyResponse> {
    try {
      if (tx) {
        this.logger.log(
          `Executando a criação da resposta da pesquisa dentro de uma transação existente.`
        );
        return await this._create(data, tx as any);
      }
      this.logger.log(
        `Iniciando uma nova transação para criação da resposta da pesquisa.`
      );
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._create(data, prismaTransactionClient as any);
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'SurveyResponse', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  private async _create(
    data: CreateSurveyResponseDto,
    prisma: Prisma.TransactionClient
  ): Promise<SurveyResponse> {
    this.logger.log(
      `Criando resposta da pesquisa com dados: ${JSON.stringify(data)}`
    );
    const { answers, surveyId, userId } = data;

    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: { questions: true }
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    const questionTypes = new Map(survey.questions.map((q) => [q.id, q.type]));

    const answersCreateInput = answers.map((answer) => {
      const questionType = questionTypes.get(answer.questionId);
      if (!questionType) {
        throw new BadRequestException(
          `Question with ID ${answer.questionId} not found in survey ${surveyId}`
        );
      }

      const createInput: any = {
        question: { connect: { id: answer.questionId } }
      };

      switch (questionType) {
        case SurveyQuestionType.TEXT:
          createInput.stringValue = String(answer.value) as string;
          break;
        case SurveyQuestionType.RATING:
          createInput.intValue = Number(answer.value) as number;
          break;
        case SurveyQuestionType.BOOLEAN:
          createInput.boolValue = Boolean(answer.value) as boolean;
          break;
        case SurveyQuestionType.MULTIPLE:
          if (Array.isArray(answer.value)) {
            createInput.options = {
              create: (
                answer.value as {
                  optionId: string;
                }[]
              ).map((opt) => ({
                optionId: opt.optionId
              }))
            };
          }
          break;
        default:
          throw new BadRequestException(`Unsupported question type`);
      }

      return createInput;
    });

    const prismaCreateInput: Prisma.SurveyResponseCreateInput = {
      survey: { connect: { id: surveyId } },
      user: { connect: { id: userId } },
      answers: {
        create: answersCreateInput
      }
    };

    try {
      return await prisma.surveyResponse.create({
        data: prismaCreateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'SurveyResponse', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list(queryParams?: {
    [key: string]: string;
  }): Promise<SurveyResponse[]> {
    const whereArgs: Prisma.SurveyResponseWhereInput = {};

    if (queryParams && Object.keys(queryParams).length) {
      const { surveyId, userId } = queryParams;
      if (surveyId) {
        whereArgs.survey = { id: surveyId };
      }
      if (userId) {
        whereArgs.user = { id: parseInt(userId, 10) };
      }
    }

    return await this.prisma.surveyResponse.findMany({
      where: whereArgs,
      include: this.includeRelations,
      orderBy: {
        completedAt: 'desc'
      }
    });
  }

  async show(id: string): Promise<SurveyResponse> {
    await this.exists(id);
    return await this.prisma.surveyResponse.findUniqueOrThrow({
      where: { id },
      include: this.includeRelations
    });
  }

  async delete(id: string): Promise<void> {
    await this.exists(id);
    await this.prisma.surveyResponse.delete({ where: { id } });
  }

  async exists(id: string): Promise<void> {
    if (!(await this.prisma.surveyResponse.count({ where: { id } }))) {
      throw new NotFoundException(`SurveyResponse ${id} not found`);
    }
  }
}
