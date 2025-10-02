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
  WorkerManualFrequencyUpdateDto
} from './dto/worker-manual-frequency.dto';

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

  async update(
    workerId: number,
    date: Date,
    data: WorkerManualFrequencyUpdateDto
  ): Promise<WorkerManualFrequency> {
    try {
      return await this.prisma.workerManualFrequency.update({
        where: { workerId_date: { workerId, date } },
        data
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerManualFrequency', {
        operation: 'update',
        id: workerId,
        data
      });
      throw error;
    }
  }

  async list(): Promise<WorkerManualFrequency[]> {
    return await this.prisma.workerManualFrequency.findMany();
  }

  async show(workerId: number, date: Date): Promise<WorkerManualFrequency> {
    await this.exists(workerId, date);
    return await this.prisma.workerManualFrequency.findUnique({
      where: { workerId_date: { workerId, date } },
      include: {
        worker: true,
        workerManualFrequencyType: true,
        user: true
      }
    });
  }

  async delete(workerId: number, date: Date): Promise<void> {
    await this.exists(workerId, date);
    await this.prisma.workerManualFrequency.delete({
      where: { workerId_date: { workerId, date } }
    });
  }

  async exists(workerId: number, date: Date): Promise<void> {
    if (
      !(await this.prisma.workerManualFrequency.count({
        where: { workerId: workerId, date: date }
      }))
    ) {
      throw new NotFoundException(
        `WorkerManualFrequency ${workerId} and ${date} not found`
      );
    }
  }
}
