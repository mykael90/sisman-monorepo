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
import { WorkerSpecialty } from '@sisman/prisma';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  WorkerSpecialtyCreateDto,
  WorkerSpecialtyUpdateDto
} from './dto/worker-specialty.dto';

@Injectable()
export class WorkersSpecialtiesService {
  private readonly logger = new Logger(WorkersSpecialtiesService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: WorkerSpecialtyCreateDto): Promise<WorkerSpecialty> {
    this.logger.log(`Criando especialidade com dados: ${JSON.stringify(data)}`);

    try {
      return await this.prisma.workerSpecialty.create({
        data
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerSpecialty', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async update(
    id: number,
    data: WorkerSpecialtyUpdateDto
  ): Promise<WorkerSpecialty> {
    try {
      return await this.prisma.workerSpecialty.update({
        where: { id },
        data
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerSpecialty', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async list(): Promise<WorkerSpecialty[]> {
    return await this.prisma.workerSpecialty.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  async show(id: number): Promise<WorkerSpecialty> {
    await this.exists(id);
    return await this.prisma.workerSpecialty.findUnique({
      where: { id }
    });
  }

  async delete(id: number): Promise<void> {
    await this.exists(id);
    await this.prisma.workerSpecialty.delete({ where: { id } });
  }

  async exists(id: number): Promise<void> {
    if (!(await this.prisma.workerSpecialty.count({ where: { id } }))) {
      throw new NotFoundException(`WorkerSpecialty ${id} not found`);
    }
  }
}
