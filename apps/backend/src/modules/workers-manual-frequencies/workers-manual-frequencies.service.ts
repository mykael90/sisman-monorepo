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
import { Prisma, WorkerManualFrequency } from '@sisman/prisma';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  WorkerManualFrequencyCreateDto,
  WorkerManualFrequencyCreateManyDto,
  WorkerManualFrequencyUpdateDto
} from './dto/worker-manual-frequency.dto';
import { gteDate, lteDate } from '../../shared/utils/date-utils';

@Injectable()
export class WorkersManualFrequenciesService {
  private readonly logger = new Logger(WorkersManualFrequenciesService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(
    data: WorkerManualFrequencyCreateDto
  ): Promise<WorkerManualFrequency> {
    this.logger.log(
      `Criando frequência manual com dados: ${JSON.stringify(data)}`
    );

    const createInput: Prisma.WorkerManualFrequencyUncheckedCreateInput = {
      workerId: data.workerId,
      date: data.date,
      hours: data.hours,
      workerManualFrequencyTypeId: data.workerManualFrequencyTypeId,
      notes: data.notes,
      userId: data.userId
    };

    this.logger.log(`Input para Prisma: ${JSON.stringify(createInput)}`);

    try {
      return await this.prisma.workerManualFrequency.create({
        data: createInput
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerManualFrequency', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async createMany(
    data: WorkerManualFrequencyCreateManyDto
  ): Promise<Prisma.BatchPayload> {
    this.logger.log(
      `Criando múltiplas frequências manuais com dados: ${JSON.stringify(data)}`
    );

    const { items } = data;

    const createManyInput: Prisma.WorkerManualFrequencyUncheckedCreateInput[] =
      items.map((item) => ({
        workerId: item.workerId,
        date: item.date,
        hours: item.hours,
        workerManualFrequencyTypeId: item.workerManualFrequencyTypeId,
        notes: item.notes,
        userId: item.userId
      }));

    this.logger.log(
      `Input para Prisma (createMany): ${JSON.stringify(createManyInput)}`
    );

    try {
      return await this.prisma.workerManualFrequency.createMany({
        data: createManyInput,
        skipDuplicates: true // Ou false, dependendo da necessidade de negócio
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerManualFrequency', {
        operation: 'createMany',
        data
      });
      throw error;
    }
  }

  async update(
    id: number,
    data: WorkerManualFrequencyUpdateDto
  ): Promise<WorkerManualFrequency> {
    try {
      return await this.prisma.workerManualFrequency.update({
        where: { id },
        data
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerManualFrequency', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async list(): Promise<WorkerManualFrequency[]> {
    return await this.prisma.workerManualFrequency.findMany({
      include: {
        worker: true,
        workerManualFrequencyType: true,
        user: true
      }
    });
  }

  async show(id: number): Promise<WorkerManualFrequency> {
    await this.exists(id);
    return await this.prisma.workerManualFrequency.findUnique({
      where: { id },
      include: {
        worker: true,
        workerManualFrequencyType: true,
        user: true
      }
    });
  }

  async delete(id: number): Promise<void> {
    await this.exists(id);
    await this.prisma.workerManualFrequency.delete({
      where: { id }
    });
  }

  async exists(id: number): Promise<void> {
    if (
      !(await this.prisma.workerManualFrequency.count({
        where: { id }
      }))
    )
      throw new NotFoundException(
        `WorkerManualFrequency with id ${id} not found`
      );
  }

  async getFrequenciesWithContracts(queryParams?: { [key: string]: string }) {
    const whereArgs: Prisma.WorkerManualFrequencyWhereInput = {};

    //funcao para pegar apenas a parte da data e depois criar o objeto em typescript

    if (queryParams && !!Object.keys(queryParams).length) {
      const { startDate, endDate } = queryParams;

      if (startDate && endDate) {
        whereArgs.date = {
          gte: gteDate(startDate),
          lte: lteDate(endDate)
        };
      }
    }

    // A consulta agora é uma única chamada ao banco de dados.
    const frequenciesWithContracts =
      await this.prisma.workerManualFrequency.findMany({
        include: {
          // Peça ao Prisma para incluir o WorkerContract relacionado.
          // Ele usará a relação `workerContract` que você definiu no schema.
          workerContract: {
            include: {
              sipacUnitLocation: {
                select: { codigoUnidade: true, sigla: true }
              },
              contract: { select: { codigoSipac: true, subject: true } },
              workerSpecialty: {
                select: {
                  name: true
                }
              }
            }
          },

          // Você também pode incluir outros dados relacionados, se precisar.
          worker: {
            select: {
              name: true // Exemplo: selecionando apenas o nome do trabalhador
            }
          },
          workerManualFrequencyType: true,
          user: true
        },
        where: whereArgs,
        // Opcional: para ordenar os resultados
        orderBy: {
          date: 'desc'
        }
      });

    return frequenciesWithContracts;
  }

  async getFrequenciesForContracts(queryParams?: { [key: string]: string }) {
    const whereArgs: Prisma.WorkerManualFrequencyWhereInput = {};

    //funcao para pegar apenas a parte da data e depois criar o objeto em typescript

    if (queryParams && !!Object.keys(queryParams).length) {
      const { startDate, endDate } = queryParams;

      if (startDate && endDate) {
        whereArgs.date = {
          gte: gteDate(startDate),
          lte: lteDate(endDate)
        };
      }
    }

    // A consulta agora é uma única chamada ao banco de dados.
    const frequenciesForContracts = await this.prisma.workerContract.findMany({
      include: {
        worker: {
          select: {
            name: true // Exemplo: selecionando apenas o nome do trabalhador
          }
        },
        workerManualFrequency: {
          include: {
            workerManualFrequencyType: true,
            user: true
          },
          where: whereArgs,
          // Opcional: para ordenar os resultados
          orderBy: {
            date: 'desc'
          }
        },
        sipacUnitLocation: {
          select: { codigoUnidade: true, sigla: true }
        },
        contract: { select: { codigoSipac: true, subject: true } },
        workerSpecialty: {
          select: {
            name: true
          }
        }
      },
      where: {
        workerManualFrequency: {
          some: whereArgs
        }
      },
      orderBy: {
        worker: {
          name: 'asc'
        }
      }
    });

    return frequenciesForContracts;
  }
}
