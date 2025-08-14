import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';
import { MaterialsMapper } from './mappers/materials.mapper';
import { Prisma } from '@sisman/prisma';

@Injectable()
export class MaterialsService {
  private logger = new Logger(MaterialsService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}
  async create(data: CreateMaterialDto) {
    return await this.prisma.materialGlobalCatalog.create({ data });
  }

  async findAll() {
    return await this.prisma.materialGlobalCatalog.findMany();
  }

  async findOne(id: string) {
    const exists = await this.exists(id);
    if (!exists) throw new NotFoundException('Material not found');
    return await this.prisma.materialGlobalCatalog.findFirst({ where: { id } });
  }

  async update(id: string, data: UpdateMaterialDto) {
    const exists = await this.exists(id);
    if (!exists) throw new NotFoundException('Material not found');
    return await this.prisma.materialGlobalCatalog.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    const exists = await this.exists(id);
    if (!exists) throw new NotFoundException('Material not found');
    return await this.prisma.materialGlobalCatalog.delete({ where: { id } });
  }

  async exists(id: string) {
    return await this.prisma.materialGlobalCatalog.exists({ id });
  }

  async syncFromSipacMateriais() {
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

    try {
      const result = await this.prisma.materialGlobalCatalog.createMany({
        data: createMaterialDtos,
        skipDuplicates: true // Ignora registros duplicados (baseado na chave primária 'id').
      });

      return result; // Retorna a lista original de materiais do Sipac.
    } catch (error) {
      // Considere um tratamento de erro mais específico ou logging.
      console.error('Error during Sipac material synchronization:', error);
      throw new BadRequestException(
        'Failed to synchronize materials from Sipac during database operation.'
      );
    }
  }
}
