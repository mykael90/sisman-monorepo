import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import { FindManyContractProvidersDto } from './dto/find-many-contract-providers.dto';
import {
  CreateContractProviderDto,
  UpdateContractProviderDto
} from './dto/contract-provider.dto';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { ContractProvider, Prisma, User } from '@sisman/prisma';

@Injectable()
export class ContractProvidersService {
  private readonly logger = new Logger(ContractProvidersService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: CreateContractProviderDto): Promise<ContractProvider> {
    this.logger.log(
      `Criando fornecedor de contrato com dados: ${JSON.stringify(data)}`
    );

    try {
      return await this.prisma.contractProvider.create({ data });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Fornecedor de Contrato', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list({
    page,
    perPage,
    orderBy,
    order,
    ...rest
  }: FindManyContractProvidersDto): Promise<[ContractProvider[], number]> {
    const where: Prisma.ContractProviderWhereInput = {
      ...rest
    };

    const [providers, count] = await this.prisma.$transaction([
      this.prisma.contractProvider.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { [orderBy]: order },
        where
      }),
      this.prisma.contractProvider.count({ where })
    ]);

    return [providers, count];
  }

  async show(id: number): Promise<ContractProvider> {
    await this.exists(id);
    return this.prisma.contractProvider.findUnique({
      where: { id }
    });
  }

  async update(
    id: number,
    data: UpdateContractProviderDto
  ): Promise<ContractProvider> {
    await this.exists(id);
    this.logger.log(
      `Atualizando fornecedor de contrato ${id} com dados: ${JSON.stringify(data)}`
    );

    try {
      return await this.prisma.contractProvider.update({
        where: { id },
        data
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Fornecedor de Contrato', {
        operation: 'update',
        data
      });
      throw error;
    }
  }

  async delete(id: number): Promise<ContractProvider> {
    await this.exists(id);
    this.logger.log(`Removendo fornecedor de contrato ${id}`);

    try {
      return await this.prisma.contractProvider.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Fornecedor de Contrato', {
        operation: 'delete',
        data: { id }
      });
      throw error;
    }
  }

  async exists(id: number): Promise<void> {
    const provider = await this.prisma.contractProvider.findUnique({
      where: { id }
    });

    if (!provider) {
      throw new NotFoundException(
        `Fornecedor de contrato com ID ${id} não encontrado.`
      );
    }
  }
}
