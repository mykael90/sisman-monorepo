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

  async getFrequenciesWithContracts() {
    // 1. Buscar todos os registros de frequência manual.
    const frequencies = await this.prisma.workerManualFrequency.findMany({
      include: {
        worker: true // Inclui o trabalhador para referência
      }
    });

    // 2. Extrair os IDs únicos dos trabalhadores para buscar seus contratos de forma eficiente.
    const workerIds = [...new Set(frequencies.map((f) => f.workerId))];

    // 3. Buscar todos os contratos para os trabalhadores relevantes em uma única consulta.
    const contracts = await this.prisma.workerContract.findMany({
      where: {
        workerId: {
          in: workerIds
        }
      }
    });

    // 4. Mapear os contratos por workerId para facilitar a busca.
    const contractsByWorker = contracts.reduce((acc, contract) => {
      const workerContracts = acc.get(contract.workerId) || [];
      workerContracts.push(contract);
      acc.set(contract.workerId, workerContracts);
      return acc;
    }, new Map());

    // 5. Combinar os registros de frequência com o contrato ativo na data correspondente.
    const result = frequencies.map((frequency) => {
      const workerContracts = contractsByWorker.get(frequency.workerId) || [];

      // Encontra o primeiro contrato que estava ativo na data da frequência.
      const activeContract = workerContracts.find((contract) => {
        const isAfterStartDate = frequency.date >= contract.startDate;
        const isBeforeEndDate =
          !contract.endDate || frequency.date <= contract.endDate;
        return isAfterStartDate && isBeforeEndDate;
      });

      return {
        ...frequency,
        workerContract: activeContract || null // Anexa o contrato encontrado ou null.
      };
    });

    return result;
  }

  async insertContractIdInAllFrequencies() {
    const frequencies = await this.getFrequenciesWithContracts();

    for (const frequency of frequencies) {
      if (frequency.workerContract) {
        try {
          await this.prisma.workerManualFrequency.update({
            where: { id: frequency.id },
            data: {
              workerContractId: frequency.workerContract.id
            }
          });
        } catch (error) {
          this.logger.log(error);
          console.log(error);
        }
      }
    }
  }
}
