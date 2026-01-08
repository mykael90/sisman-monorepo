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
import { Prisma, Survey } from '@sisman/prisma';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  CreateSurveyWithRelationsDto,
  UpdateSurveyDto,
  UpdateSurveyWithRelationsDto
} from './dto/survey.dto';
import {
  CreateSurveyQuestionDto,
  CreateSurveyQuestionOptionsDto
} from '../survey-questions/dto/survey-questions.dto';

// Tipos auxiliares para permitir o acesso ao 'id' que não existe no DTO de Create base.
// Isso evita erros de TS ao ler data.questions[i].id
type OptionInput = Partial<CreateSurveyQuestionOptionsDto> & { id?: string };
type QuestionInput = Partial<CreateSurveyQuestionDto> & {
  id?: string;
  surveyQuestionOptions?: OptionInput[];
};

@Injectable()
export class SurveysService {
  private readonly logger = new Logger(SurveysService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  private readonly includeRelations: Prisma.SurveyInclude = {
    questions: {
      include: {
        answers: true,
        surveyQuestionOptions: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    },
    responses: true
  };

  async create(
    data: CreateSurveyWithRelationsDto,
    tx?: Prisma.TransactionClient
  ) {
    try {
      if (tx) {
        this.logger.log(
          `Executando a criação da pesquisa dentro de uma transação existente.`
        );
        return await this._create(data, tx as any);
      }
      this.logger.log(`Iniciando uma nova transação para criação da pesquisa.`);
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._create(data, prismaTransactionClient as any);
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Survey', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  private async _create(
    data: CreateSurveyWithRelationsDto,
    prisma: Prisma.TransactionClient
  ): Promise<Survey> {
    this.logger.log(`Criando pesquisa com dados: ${JSON.stringify(data)}`);
    const { questions, ...restOfData } = data;

    const prismaCreateInput: Prisma.SurveyCreateInput = {
      ...restOfData,
      questions: questions
        ? {
            create: questions.map((question) => ({
              text: question.text,
              order: question.order,
              type: question.type,
              required: question.required,
              surveyQuestionOptions: question.surveyQuestionOptions
                ? {
                    create: question.surveyQuestionOptions.map((option) => ({
                      label: option.label,
                      value: option.value,
                      order: option.order
                    }))
                  }
                : undefined
            }))
          }
        : undefined
    };

    try {
      return await prisma.survey.create({
        data: prismaCreateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Survey', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  // =================================================================
  // UPDATE INTELIGENTE (RECONCILIAÇÃO)
  // =================================================================

  async update(
    id: string,
    data: UpdateSurveyWithRelationsDto,
    tx?: Prisma.TransactionClient
  ) {
    try {
      await this.exists(id);

      if (tx) {
        return await this._update(id, data, tx as any);
      }

      // Abre transação para garantir atomicidade do diff
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._update(id, data, prismaTransactionClient as any);
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Survey', {
        operation: 'update',
        surveyId: id,
        data
      });
      throw error;
    }
  }

  private async _update(
    surveyId: string,
    data: UpdateSurveyWithRelationsDto,
    prisma: Prisma.TransactionClient
  ): Promise<Survey> {
    this.logger.log(`Atualizando Survey ${surveyId} e suas relações.`);

    const { questions, ...surveyScalarData } = data;

    // 1. Atualiza dados escalares da Survey (título, descrição, etc)
    if (Object.keys(surveyScalarData).length > 0) {
      await prisma.survey.update({
        where: { id: surveyId },
        data: surveyScalarData
      });
    }

    // 2. Se houver array de questões, executa a reconciliação (Diff)
    if (questions) {
      // Cast necessário pois o DTO base não tem 'id', mas o payload de update traz
      const questionsInput = questions as QuestionInput[];
      await this._reconcileQuestions(surveyId, questionsInput, prisma);
    }

    // Retorna objeto atualizado
    return await prisma.survey.findUniqueOrThrow({
      where: { id: surveyId },
      include: this.includeRelations
    });
  }

  /**
   * Lógica de Diff para Perguntas:
   * - Deleta o que sumiu
   * - Atualiza o que tem ID
   * - Cria o que é novo (sem ID)
   */
  private async _reconcileQuestions(
    surveyId: string,
    questionsPayload: QuestionInput[],
    prisma: Prisma.TransactionClient
  ) {
    // A. Buscar IDs atuais no banco
    const dbQuestions = await prisma.surveyQuestion.findMany({
      where: { surveyId },
      select: { id: true }
    });
    const dbIds = dbQuestions.map((q) => q.id);

    // B. Separar IDs que vieram no payload
    const payloadIds = questionsPayload
      .filter((q) => q.id)
      .map((q) => q.id as string);

    // C. DELETE: IDs que estão no banco mas não no payload
    const toDelete = dbIds.filter((id) => !payloadIds.includes(id));
    if (toDelete.length > 0) {
      await prisma.surveyQuestion.deleteMany({
        where: { id: { in: toDelete } }
      });
    }

    // D. Loop para UPDATE ou CREATE
    for (const q of questionsPayload) {
      // Se tem ID e o ID existe no banco -> UPDATE
      if (q.id && dbIds.includes(q.id)) {
        const { surveyQuestionOptions, ...qData } = q;

        await prisma.surveyQuestion.update({
          where: { id: q.id },
          data: {
            text: qData.text,
            order: qData.order,
            type: qData.type,
            required: qData.required
          }
        });

        // Reconciliar Opções (nested diff)
        if (surveyQuestionOptions) {
          await this._reconcileOptions(q.id, surveyQuestionOptions, prisma);
        }
      } else {
        // Se não tem ID ou ID é novo -> CREATE
        await prisma.surveyQuestion.create({
          data: {
            surveyId,
            text: q.text!, // '!' pois assumimos validação no Controller/DTO
            order: q.order!,
            type: q.type!,
            required: q.required ?? false,
            // Criar opções aninhadas diretamente na criação da pergunta
            surveyQuestionOptions: q.surveyQuestionOptions
              ? {
                  create: q.surveyQuestionOptions.map((opt) => ({
                    label: opt.label!,
                    value: opt.value!,
                    order: opt.order!
                  }))
                }
              : undefined
          }
        });
      }
    }
  }

  /**
   * Lógica de Diff para Opções (Mesmo princípio das perguntas)
   */
  private async _reconcileOptions(
    questionId: string,
    optionsPayload: OptionInput[],
    prisma: Prisma.TransactionClient
  ) {
    const dbOptions = await prisma.surveyQuestionOptions.findMany({
      where: { questionId },
      select: { id: true }
    });
    const dbIds = dbOptions.map((o) => o.id);

    const payloadIds = optionsPayload
      .filter((o) => o.id)
      .map((o) => o.id as string);

    // Delete
    const toDelete = dbIds.filter((id) => !payloadIds.includes(id));
    if (toDelete.length > 0) {
      await prisma.surveyQuestionOptions.deleteMany({
        where: { id: { in: toDelete } }
      });
    }

    // Update ou Create
    for (const opt of optionsPayload) {
      if (opt.id && dbIds.includes(opt.id)) {
        await prisma.surveyQuestionOptions.update({
          where: { id: opt.id },
          data: {
            label: opt.label,
            value: opt.value,
            order: opt.order
          }
        });
      } else {
        await prisma.surveyQuestionOptions.create({
          data: {
            questionId,
            label: opt.label!,
            value: opt.value!,
            order: opt.order!
          }
        });
      }
    }
  }

  async list(queryParams?: { [key: string]: string }) {
    const whereArgs: Prisma.SurveyWhereInput = {};

    if (queryParams && !!Object.keys(queryParams).length) {
      const { isActive, showModal } = queryParams;
      if (isActive) {
        whereArgs.isActive = isActive === 'true';
      }
      if (showModal) {
        whereArgs.showModal = showModal === 'true';
      }
    }

    return await this.prisma.survey.findMany({
      where: whereArgs,
      include: this.includeRelations,
      orderBy: {
        title: 'asc'
      }
    });
  }

  async show(id: string) {
    await this.exists(id);
    return await this.prisma.survey.findUnique({
      where: { id },
      include: this.includeRelations
    });
  }

  async delete(id: string) {
    await this.exists(id);
    return await this.prisma.survey.delete({ where: { id } });
  }

  async exists(id: string) {
    if (!(await this.prisma.survey.count({ where: { id } }))) {
      throw new NotFoundException(`Survey ${id} not found`);
    }
  }
}
