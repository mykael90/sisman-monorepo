import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@sisman/prisma';
import {
  ExtendedPrismaClient,
  PrismaService
} from 'src/shared/prisma/prisma.module';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  CreateMaterialDto,
  FindAllMaterialQueryDto,
  UpdateMaterialDto
} from './dto/material.dto';
import { MaterialsMapper } from './mappers/materials.mapper';

@Injectable()
export class MaterialsService {
  private logger = new Logger(MaterialsService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}
  async create(data: CreateMaterialDto) {
    try {
      return await this.prisma.materialGlobalCatalog.create({ data });
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
        return await this.prisma.materialGlobalCatalog.findMany();
      }

      const findManyArgs: Prisma.MaterialGlobalCatalogFindManyArgs = {};

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

  async findOne(id: string) {
    try {
      const exists = await this.exists(id);
      if (!exists) throw new NotFoundException('Material not found');
      return await this.prisma.materialGlobalCatalog.findFirst({
        where: { id }
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'findOne',
        id
      });
      throw error;
    }
  }

  async update(id: string, data: UpdateMaterialDto) {
    try {
      const exists = await this.exists(id);
      if (!exists) throw new NotFoundException('Material not found');
      return await this.prisma.materialGlobalCatalog.update({
        where: { id },
        data
      });
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

      const createMaterialDtos = sipacMateriais.map((item) =>
        MaterialsMapper.toCreateDto(item)
      );

      const result = await this.prisma.materialGlobalCatalog.createMany({
        data: createMaterialDtos,
        skipDuplicates: true // Ignora registros duplicados (baseado na chave primária 'id').
      });

      return result; // Retorna a lista original de materiais do Sipac.
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialsService', {
        operation: 'syncFromSipacMateriais'
      });
      throw error;
    }
  }
}
