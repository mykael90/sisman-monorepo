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
import { Prisma, Contract } from '@sisman/prisma';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  CreateContractDto,
  CreateContractWithRelationsDto,
  UpdateContractDto,
  UpdateContractWithRelationsDto
} from './dto/contract.dto';
import { FindManyContractsDto } from './dto';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  private readonly includeRelations: Prisma.ContractInclude = {
    providers: true
  };

  async create(data: CreateContractWithRelationsDto): Promise<Contract> {
    this.logger.log(`Criando contrato com dados: ${JSON.stringify(data)}`);
    const { providers, ...restOfData } = data;

    const prismaCreateInput: Prisma.ContractCreateInput = {
      ...restOfData,
      providers: providers ? { connect: { id: providers.id } } : undefined
    };

    try {
      return await this.prisma.contract.create({
        data: prismaCreateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Contrato', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async update(
    id: number,
    data: UpdateContractWithRelationsDto
  ): Promise<Contract> {
    await this.findOne(id);
    const { providers, ...restOfData } = data;

    const prismaUpdateInput: Prisma.ContractUpdateInput = {
      ...restOfData
    };

    if (providers) {
      prismaUpdateInput.providers = {
        connect: { id: providers.id }
      };
    }

    try {
      return await this.prisma.contract.update({
        where: { id },
        data: prismaUpdateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Contrato', {
        operation: 'update',
        id,
        data: prismaUpdateInput
      });
      throw error;
    }
  }

  async list() {
    // const { page, perPage, orderBy, order, search } = params;

    const contracts = await this.prisma.contract.findMany();
    return contracts;

    // const skip = (page - 1) * perPage;
    // const take = perPage;

    // const where: Prisma.ContractWhereInput = {};

    // if (search) {
    //   where.OR = [
    //     { number: { contains: search, mode: 'insensitive' } },
    //     { description: { contains: search, mode: 'insensitive' } }
    //   ];
    // }

    // this.logger.log(`this.prisma: ${Object.keys(this.prisma)}`);
    // this.logger.log(`this.prisma.contract: ${this.prisma.contract}`);
    // const [contracts, total] = await this.prisma.$transaction([
    //   this.prisma.contract.findMany({
    //     where,
    //     include: this.includeRelations,
    //     skip,
    //     take,
    //     orderBy: {
    //       [orderBy]: order
    //     }
    //   }),
    //   this.prisma.contract.count({ where })
    // ]);

    // return {
    //   data: contracts,
    //   page,
    //   perPage,
    //   total,
    //   totalPages: Math.ceil(total / perPage)
    // };
  }

  async findOne(id: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: this.includeRelations
    });

    if (!contract) {
      throw new NotFoundException(`Contrato com id ${id} não encontrado`);
    }

    return contract;
  }

  async show(id: number) {
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.findOne(id);
    return await this.prisma.contract.delete({ where: { id } });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.contract.count({ where: { id } });
    return count > 0;
  }
}
