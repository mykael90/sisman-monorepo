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
import { WorkerManualFrequencyType } from '@sisman/prisma';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  WorkerManualFrequencyTypeCreateDto,
  WorkerManualFrequencyTypeUpdateDto
} from './dto/worker-manual-frequency-type.dto';

@Injectable()
export class WorkersManualFrequenciesTypesService {
  private readonly logger = new Logger(
    WorkersManualFrequenciesTypesService.name
  );

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(
    data: WorkerManualFrequencyTypeCreateDto
  ): Promise<WorkerManualFrequencyType> {
    this.logger.log(
      `Criando tipo de frequência manual com dados: ${JSON.stringify(data)}`
    );

    try {
      return await this.prisma.workerManualFrequencyType.create({
        data
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerManualFrequencyType', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async update(
    id: number,
    data: WorkerManualFrequencyTypeUpdateDto
  ): Promise<WorkerManualFrequencyType> {
    try {
      return await this.prisma.workerManualFrequencyType.update({
        where: { id },
        data
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerManualFrequencyType', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async list(): Promise<WorkerManualFrequencyType[]> {
    return await this.prisma.workerManualFrequencyType.findMany();
  }

  async show(id: number): Promise<WorkerManualFrequencyType> {
    await this.exists(id);
    return await this.prisma.workerManualFrequencyType.findUnique({
      where: { id }
    });
  }

  async delete(id: number): Promise<void> {
    await this.exists(id);
    await this.prisma.workerManualFrequencyType.delete({ where: { id } });
  }

  async exists(id: number): Promise<void> {
    if (
      !(await this.prisma.workerManualFrequencyType.count({ where: { id } }))
    ) {
      throw new NotFoundException(`WorkerManualFrequencyType ${id} not found`);
    }
  }
}
