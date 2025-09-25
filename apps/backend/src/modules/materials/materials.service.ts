import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@sisman/prisma';
import {
  ExtendedPrismaClient,
  PrismaService
} from 'src/shared/prisma/prisma.module';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  CreateMaterialDto,
  FindAllMaterialByWarehouseIdQueryDto,
  FindAllMaterialQueryDto,
  UpdateMaterialDto
} from './dto/material.dto';
import { MaterialsMapper } from './mappers/materials.mapper';
import { find } from 'lodash';
import { number } from 'joi';

@Injectable()
export class MaterialsService {
  private logger = new Logger(MaterialsService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: CreateMaterialDto, tx?: Prisma.TransactionClient) {
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
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  private async _create(
    data: CreateMaterialDto,
    prisma: Prisma.TransactionClient
  ) {
    try {
      return await prisma.materialGlobalCatalog.create({ data });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async findAll(queryParams?: FindAllMaterialQueryDto) {
    try {
      if (!queryParams) {
        return await this.prisma.materialGlobalCatalog.findMany({
          orderBy: {
            name: 'asc'
          }
        });
      }

      const findManyArgs: Prisma.MaterialGlobalCatalogFindManyArgs = {};

      findManyArgs.orderBy = {
        name: 'asc'
      };

      if (queryParams.warehouseId) {
        findManyArgs.include = {
          warehouseStandardStocks: {
            where: {
              warehouseId: queryParams.warehouseId
            }
          }
        };
      }

      return await this.prisma.materialGlobalCatalog.findMany(findManyArgs);
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'findAll',
        queryParams
      });
      throw error;
    }
  }

  async findAllByWarehouseId(
    warehouseId: number,
    queryParams?: FindAllMaterialByWarehouseIdQueryDto
  ) {
    try {
      if (!queryParams) {
        return await this.prisma.materialGlobalCatalog.findMany({
          orderBy: {
            name: 'asc'
          },
          include: {
            warehouseStandardStocks: {
              where: {
                warehouseId: warehouseId
              }
            }
          }
        });
      }

      const findManyArgs: Prisma.MaterialGlobalCatalogFindManyArgs = {};

      findManyArgs.orderBy = {
        name: 'asc'
      };

      findManyArgs.include = {
        warehouseStandardStocks: {
          where: {
            warehouseId: warehouseId
          }
        }
      };

      if (queryParams.onlyWarehouse) {
        findManyArgs.where = {
          warehouseStandardStocks: {
            some: {
              warehouseId: warehouseId
            }
          }
        };
      }
      return await this.prisma.materialGlobalCatalog.findMany(findManyArgs);
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'findAllByWarehouseId',
        warehouseId
      });
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const exists = await this.exists(id);
      if (!exists) throw new NotFoundException('Material not found');
      return await this.prisma.materialGlobalCatalog.findFirst({
        where: { id },
        include: {
          warehouseStandardStocks: true
        }
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'findOne',
        id
      });
      throw error;
    }
  }

  async update(
    id: string,
    data: UpdateMaterialDto,
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
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'update',
        data
      });
      throw error;
    }
  }

  private async _update(
    id: string,
    data: UpdateMaterialDto,
    prisma: Prisma.TransactionClient
  ) {
    try {
      const exists = await this.exists(id);
      if (!exists) {
        throw new NotFoundException('Material not found');
      }

      // 1. Obter o estado atual do material antes da atualização
      const currentMaterial = await prisma.materialGlobalCatalog.findUnique({
        where: { id },
        select: {
          name: true,
          description: true,
          unitOfMeasure: true,
          unitPrice: true,
          updatedAt: true // Para o campo deprecatedAt do histórico
        }
      });

      if (!currentMaterial) {
        // Isso não deveria acontecer se o `exists` acima for verdadeiro, mas é uma boa prática
        throw new NotFoundException('Material not found after initial check.');
      }

      // 2. Verificar se algum campo relevante para o histórico mudou
      let hasSignificantChanges = false;
      const historyData: Prisma.MaterialGLobalCatalogHistoryCreateInput = {
        materialGlobalCatalog: { connect: { id: id } },
        name: currentMaterial.name,
        description: currentMaterial.description,
        unitOfMeasure: currentMaterial.unitOfMeasure,
        unitPrice: currentMaterial.unitPrice,
        deprecatedAt: new Date() // A data em que o valor antigo se tornou "deprecado"
      };

      // Comparação de 'name'
      if (data.name !== undefined && currentMaterial.name !== data.name) {
        hasSignificantChanges = true;
      }

      // Comparação de 'description'
      if (
        data.description !== undefined &&
        currentMaterial.description !== data.description
      ) {
        hasSignificantChanges = true;
      }

      // Comparação de 'unitOfMeasure'
      if (
        data.unitOfMeasure !== undefined &&
        currentMaterial.unitOfMeasure !== data.unitOfMeasure
      ) {
        hasSignificantChanges = true;
      }

      // Comparação de 'unitPrice' (requer tratamento especial para Decimal e null/undefined)
      if (data.unitPrice !== undefined) {
        // Convertendo o novo preço para Prisma.Decimal para comparação robusta
        const newPriceDecimal =
          data.unitPrice !== null ? new Prisma.Decimal(data.unitPrice) : null;

        if (currentMaterial.unitPrice === null && newPriceDecimal !== null) {
          // Preço mudou de null para um valor
          hasSignificantChanges = true;
        } else if (
          currentMaterial.unitPrice !== null &&
          newPriceDecimal === null
        ) {
          // Preço mudou de um valor para null
          hasSignificantChanges = true;
        } else if (
          currentMaterial.unitPrice !== null &&
          newPriceDecimal !== null
        ) {
          // Ambos são não-null, comparar valores
          if (!currentMaterial.unitPrice.equals(newPriceDecimal)) {
            hasSignificantChanges = true;
          }
        }
      }

      // 3. Realizar a operação em uma transação se houver mudanças significativas
      if (hasSignificantChanges) {
        // Cria o registro de histórico com os valores *antigos*
        await prisma.materialGLobalCatalogHistory.create({
          data: historyData
        });

        // Atualiza o registro principal
        return await prisma.materialGlobalCatalog.update({
          where: { id },
          data
        });
      } else {
        // Se não houver mudanças nos campos rastreados, apenas atualiza sem criar histórico
        return await prisma.materialGlobalCatalog.update({
          where: { id },
          data
        });
      }
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const exists = await this.exists(id);
      if (!exists) throw new NotFoundException('Material not found');
      return await this.prisma.materialGlobalCatalog.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'remove',
        id
      });
      throw error;
    }
  }

  async exists(id: string) {
    return await this.prisma.materialGlobalCatalog.exists({ id });
  }

  async syncFromSipacMateriais() {
    try {
      // O tipo Prisma.SipacMaterialGetPayload<{}>[] pode ser substituído pelo tipo
      // específico do modelo Prisma gerado para SipacMaterial, se preferível (ex: SipacMaterial[]).
      // Grupos de interesse no sipac [3019,3024,3025,3026,3028,3029,3030,3042]
      // const codigosInterestGroups = ['3024', '3026', '3028', '3030', '3042'];

      const idsInterestGroups = await this.prisma.sipacGrupoMaterial.findMany({
        // where: {
        //   codigo: {
        //     in: codigosInterestGroups
        //   }
        // },
        // select: {
        //   idGrupoMaterial: true
        // }
      });

      // if (!idsInterestGroups || idsInterestGroups.length === 0) {
      //   return []; // Nenhum grupo de material para sincronizar, retorna array vazio.
      // }

      const sipacMateriais = await this.prisma.sipacMaterial.findMany({
        where: {
          idGrupo: {
            in: idsInterestGroups.map((item) => item.idGrupoMaterial)
          }
        }
      });

      if (!sipacMateriais || sipacMateriais.length === 0) {
        return []; // Nenhum material para sincronizar, retorna array vazio.
      }

      // const createMaterialDtos = sipacMateriais
      //   .map((item) => MaterialsMapper.toCreateDto(item));

      const updateMaterialDtos = sipacMateriais.map((item) =>
        MaterialsMapper.toUpdateDto(item)
      );

      // const result = await this.prisma.materialGlobalCatalog.createMany({
      //   data: createMaterialDtos,
      //   skipDuplicates: true // Ignora registros duplicados (baseado na chave primária 'id').
      // });

      // return result; // Retorna a lista de materiais criados.

      // #### atualizacão
      let resultUpdate = {
        success: 0,
        failed: 0
      };

      for (const dto of updateMaterialDtos) {
        try {
          await this.update(dto.id, dto);
          resultUpdate.success++;
        } catch (e) {
          resultUpdate.failed++;
        }
      }

      return resultUpdate; // Retorna a lista de materiais atualizados.
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'syncFromSipacMateriais'
      });
      throw error;
    }
  }
}
