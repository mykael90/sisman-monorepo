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
import { Prisma, WorkerContract } from '@sisman/prisma';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  WorkerContractCreateDto,
  WorkerContractUpdateDto
} from './dto/worker-contract.dto';
import { WorkersService } from '../workers/workers.service';

@Injectable()
export class WorkersContractsService {
  private readonly logger = new Logger(WorkersContractsService.name);

  constructor(
    private readonly workersService: WorkersService,
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: WorkerContractCreateDto, tx?: Prisma.TransactionClient) {
    try {
      if (tx) {
        this.logger.log(
          `Executando a criação dentro de uma transação existente.`
        );
        return await this._create(data, tx as any);
      }
      this.logger.log(`Iniciando uma nova transação para criação.`);
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._create(data, prismaTransactionClient as any);
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerContract', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  private async _create(
    data: WorkerContractCreateDto,
    prisma: Prisma.TransactionClient
  ): Promise<WorkerContract> {
    this.logger.log(
      `Criando vínculo de contrato de worker com dados: ${JSON.stringify(data)}`
    );

    let { sipacUnitLocationId } = data;

    //se sipacUnitLocationId não for enviado diretamente, procurar o id pelo sipacUnitLocationCode
    if (!sipacUnitLocationId) {
      const sipacUnitLocation = await prisma.sipacUnidade.findFirst({
        select: { id: true },
        where: {
          codigoUnidade: data.sipacUnitLocationCode
        }
      });

      if (!sipacUnitLocation) {
        throw new BadRequestException(
          `Não foi possível encontrar a unidade de lotação com o código ${data.sipacUnitLocationCode}`
        );
      }

      sipacUnitLocationId = sipacUnitLocation.id;
    }

    //verificar se ainda tem algum contrato em aberto, se tiver lançar erro e impedi a criação de um novo contrato
    const openedContracts = await prisma.workerContract.findMany({
      where: {
        workerId: data.workerId,
        endDate: null
      }
    });

    if (openedContracts.length > 0) {
      throw new BadRequestException(
        `Para a criação de um novo contrato, não deve ter nenhum contrato aberto`
      );
    }

    //deletando o campo que não faz parte do input
    delete data.sipacUnitLocationCode;

    const createInput: Prisma.WorkerContractUncheckedCreateInput = {
      ...data,
      sipacUnitLocationId
    };

    try {
      const result = await prisma.workerContract.create({ data: createInput });

      //atualizar o status do worker, deixar ativo (pode ser que ja esteja ativo, mas não tem problema o importante é garantir isso)
      await this.workersService.update(
        result.workerId,
        { isActive: result.endDate === null },
        prisma
      );

      return result;
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerContract', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async update(
    id: number,
    data: WorkerContractUpdateDto,
    tx?: Prisma.TransactionClient
  ) {
    try {
      if (tx) {
        this.logger.log(
          `Executando a ataulização dentro de uma transação existente.`
        );
        return await this._update(id, data, tx as any);
      }
      this.logger.log(`Iniciando uma nova transação para atualização.`);
      return await this.prisma.$transaction(async (prismaTransactionClient) => {
        return await this._update(id, data, prismaTransactionClient as any);
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerContract', {
        operation: 'update',
        data
      });
      throw error;
    }
  }

  private async _update(
    id: number,
    data: WorkerContractUpdateDto,
    prisma: Prisma.TransactionClient
  ): Promise<WorkerContract> {
    try {
      const result = await prisma.workerContract.update({
        where: { id },
        data
      });

      //atualizar o status do worker se para qualquer caso se tiver encerramento ou não
      await this.workersService.update(
        result.workerId,
        { isActive: result.endDate === null },
        prisma
      );

      return result;
    } catch (error) {
      handlePrismaError(error, this.logger, 'WorkerContract', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async list(): Promise<WorkerContract[]> {
    return await this.prisma.workerContract.findMany({
      include: {
        worker: true,
        contract: {
          include: {
            providers: true
          }
        },
        workerSpecialty: true,
        sipacUnitLocation: true
      }
    });
  }

  async show(id: number): Promise<WorkerContract> {
    await this.exists(id);
    return await this.prisma.workerContract.findUnique({
      include: {
        worker: true,
        contract: {
          include: {
            providers: true
          }
        },
        workerSpecialty: true,
        sipacUnitLocation: true
      },
      where: { id }
    });
  }

  async delete(id: number): Promise<void> {
    await this.exists(id);
    await this.prisma.workerContract.delete({ where: { id } });
  }

  async exists(id: number): Promise<void> {
    if (!(await this.prisma.workerContract.count({ where: { id } }))) {
      throw new NotFoundException(`WorkerContract ${id} not found`);
    }
  }
}
