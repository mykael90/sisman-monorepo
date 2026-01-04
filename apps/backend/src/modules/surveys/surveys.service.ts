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
import { CreateSurveyDto, UpdateSurveyDto } from './dto/survey.dto';

@Injectable()
export class SurveysService {
  private readonly logger = new Logger(SurveysService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  private readonly includeRelations: Prisma.SurveyInclude = {
    questions: true,
    responses: true
  };

  async create(data: CreateSurveyDto, tx?: Prisma.TransactionClient) {
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
    data: CreateSurveyDto,
    prisma: Prisma.TransactionClient
  ): Promise<Survey> {
    this.logger.log(`Criando pesquisa com dados: ${JSON.stringify(data)}`);

    const prismaCreateInput: Prisma.SurveyCreateInput = {
      ...data
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

  async update(
    id: string,
    data: UpdateSurveyDto,
    tx?: Prisma.TransactionClient
  ) {
    try {
      if (tx) {
        this.logger.log(
          `Executando a atualização da pesquisa dentro de uma transação existente.`
        );
        return await this._update(id, data, tx as any);
      }
      this.logger.log(
        `Iniciando uma nova transação para atualização da pesquisa.`
      );
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._update(id, data, prismaTransactionClient as any);
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Survey', {
        operation: 'update',
        data
      });
      throw error;
    }
  }

  private async _update(
    surveyId: string,
    data: UpdateSurveyDto,
    prisma: Prisma.TransactionClient
  ): Promise<Survey> {
    this.logger.log(
      `Atualizando pesquisa ${surveyId} com dados: ${JSON.stringify(data)}`
    );

    const prismaUpdateInput: Prisma.SurveyUpdateInput = {
      ...data
    };

    try {
      return await prisma.survey.update({
        where: { id: surveyId },
        data: prismaUpdateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Survey', {
        operation: 'update',
        surveyId: surveyId,
        data: prismaUpdateInput
      });
      throw error;
    }
  }

  async list(queryParams?: { [key: string]: string }) {
    const whereArgs: Prisma.SurveyWhereInput = {};

    if (queryParams && !!Object.keys(queryParams).length) {
      const { isActive } = queryParams;
      if (isActive) {
        whereArgs.isActive = isActive === 'true';
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
      where: { id }
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
