import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { Prisma } from '@sisman/prisma';
import { SipacScrapingService } from '../sipac-scraping.service';
import {
  SipacRequisicaoManutencaoResponseItem,
  SipacSingleScrapingResponse,
  SyncResult
} from '../sipac-scraping.interfaces';
import {
  CreateSipacRequisicaoManutencaoCompletoDto,
  SipacRequisicaoManutencaoMaeAssociadaDto,
  UpdateSipacRequisicaoManutencaoDto
} from './dto/sipac-requisicao-manutencao.dto';
import { SipacRequisicaoManutencaoMapper } from './mappers/sipac-requisicao-manutencao.mapper';
import { AxiosRequestConfig } from 'axios';
import { handlePrismaError } from '../../../shared/utils/prisma-error-handler';
import { ListaRequisicoesManutencoesService } from './lista-requisicoes-manutencoes.service';
import { RequisicoesMateriaisService } from '../requisicoes-materiais/requisicoes-materiais.service';
import { removeAccentsAndSpecialChars } from '../../../shared/prisma/seeds/seed-utils';
import { normalizeString } from '../../../shared/utils/string-utils';
import { UnidadesService } from '../unidades/unidades.service';
import {
  CreateMaintenanceRequestDto,
  CreateMaintenanceRequestWithRelationsDto
} from '../../maintenance-requests/dto/maintenance-request.dto';
import { MaintenanceRequestMapper } from '../../maintenance-requests/mappers/maintenance-request.mapper';
import { MaintenanceRequestsService } from '../../maintenance-requests/maintenance-requests.service';
// import { MateriaisService } from '../materiais/materiais.service'; // TODO: Determine if MateriaisService is needed

@Injectable()
export class RequisicoesManutencoesService {
  private readonly logger = new Logger(RequisicoesManutencoesService.name);
  private readonly URL_PATH = 'sipac/requisicao/manutencao';

  private readonly CONSTANT_PARAMS = {
    // acao: 200 // Assuming a similar action parameter
    // Add other necessary constant params for maintenance requisitions
  };

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly listaRequisicoesManutencoesService: ListaRequisicoesManutencoesService,
    // private readonly materiaisService: MateriaisService, // TODO: Determine if MateriaisService is needed
    private readonly sipacScraping: SipacScrapingService,
    private readonly requisicoesMateriaisService: RequisicoesMateriaisService,
    private readonly unidadesService: UnidadesService,
    private readonly maintenanceRequestsService: MaintenanceRequestsService
  ) {}

  private processRequisicaoManutencaoData<T extends object>(
    data: T,
    relationalKeysFromDMMF: string[],
    prediosSubrips: { subRip: string }[],
    unidadeRequisitanteId?: number,
    unidadeCustoId?: number
  ): {
    prismaInput:
      | Prisma.SipacRequisicaoManutencaoCreateInput
      | Prisma.SipacRequisicaoManutencaoUpdateInput;
    relationsToInclude: Prisma.SipacRequisicaoManutencaoInclude;
  } {
    const prismaInput: any = {};
    const relationsToInclude: Prisma.SipacRequisicaoManutencaoInclude = {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const typedKey = key as keyof T;
        const value = data[typedKey];

        if (value === undefined) {
          // 'undefined' means "do not alter this field" for updates
          continue;
        }

        if (relationalKeysFromDMMF.includes(key)) {
          // If it's a relational field
          if (Array.isArray(value)) {
            if (key === 'requisicoesMateriais') {
              prismaInput[key] = {
                connect: value.map((item: any) => ({
                  id: item.id
                }))
              };
            } else if (key === 'predios') {
              prismaInput[key] = {
                connect: prediosSubrips
              };
            } else if (key === 'requisicoesManutencaoFilhas') {
              // Do nothing, handled separately if needed
            } else {
              // For other array relations, use create
              prismaInput[key] = {
                create: value
              };
            }
            (relationsToInclude as any)[key] = true;
          } else if (value !== null && typeof value === 'object') {
            // Handle single nested object relations
            if (key === 'requisicaoManutencaoMae') {
              if (value && 'id' in value && typeof value.id === 'number') {
                prismaInput[key] = {
                  connect: {
                    id: value.id
                  }
                };
              } else {
                // This case might need refinement based on how requisicaoManutencaoMae is handled in create/update
                // For now, assuming create is the intent if no ID is present
                prismaInput[key] = {
                  create: value
                };
              }
            } else if (
              typedKey === 'unidadeRequisitante' ||
              typedKey === 'unidadeCusto'
            ) {
              // `value` here is `data.unidadeRequisitante` or `data.unidadeCusto`
              // which should be `{ id: number }` if successfully processed by getOrCreateUnidade
              if (
                value &&
                'id' in value &&
                typeof (value as any).id === 'number'
              ) {
                prismaInput[key] = {
                  connect: { id: (value as any).id }
                };
              }
            } else {
              // For other single object relations, use create
              prismaInput[key] = {
                create: value
              };
            }
            (relationsToInclude as any)[key] = true;
          }
        } else {
          // Assume it's a scalar field and assign directly
          (prismaInput as any)[key] = value;
        }
      }
    }

    return { prismaInput, relationsToInclude };
  }

  // @Cron(
  //   process.env.CRON_SIPAC_REQUISICOES_MANUTENCOES_SYNC || '0 0 * * *' // Daily at midnight
  // )
  // async handleCronSyncRequisicoesManutencoes() {
  //   this.logger.log(
  //     'Iniciando sincronização agendada de requisições de manutenções do SIPAC...'
  //   );
  //   // You'll need to define how to get dataInicial and dataFinal for cron jobs
  //   // For example, sync for the previous day or week.
  //   const result = await this.fetchAllAndPersistRequisicoesManutencoes('01/01/2025', '05/01/2025'); // Placeholder dates
  //   this.logger.log(
  //     `Sincronização agendada de requisições de manutenções do SIPAC concluída. Total processado: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
  //   );
  // }

  private async persistCreateRequisicaoManutencao(
    data: CreateSipacRequisicaoManutencaoCompletoDto
  ) {
    // this.logger.log(data);

    const sipacRequisicaoManutencaoModel = Prisma.dmmf.datamodel.models.find(
      (model) => model.name === 'SipacRequisicaoManutencao'
    );

    let relationalKeysFromDMMF: string[] = [];

    if (sipacRequisicaoManutencaoModel) {
      relationalKeysFromDMMF = sipacRequisicaoManutencaoModel.fields
        .filter((field) => field.kind === 'object' && field.relationName)
        .map((field) => field.name);
    } else {
      this.logger.error(
        'Modelo SipacRequisicaoManutencao não encontrado no DMMF.'
      );
    }

    // Ensure requisicoe mae existe no banco de dados se vier no dto
    if (data.requisicaoManutencaoMae) {
      await this.ensureRequisicaoMaeExistente(data.requisicaoManutencaoMae);
    }

    // Ensure requisicoes de materials referenced in requisition items exist
    if (
      data.requisicoesMateriais &&
      data.requisicoesMateriais.length > 0 &&
      this.requisicoesMateriaisService
    ) {
      const requisicoesParaVerificar = data.requisicoesMateriais.map(
        (requisicao) => ({
          numeroAno: requisicao.numeroDaRequisicao
        })
      );
      await this.ensureRequisicoesMateriaisAssociadasExistentes(
        requisicoesParaVerificar
      ); // `as any` to simplify, ideally type correctly
    }

    // Find all predios by denominacaoPredio e rip
    // Se não encontrar, não tem problema, fica sem o relacionamento com o prédio
    const prediosSubrips = await this.prisma.sipacPredio.findMany({
      select: {
        subRip: true
      },
      where: {
        AND: [
          {
            denominacaoPredio: {
              in: data.predios.map((predio) => normalizeString(predio.predio))
            }
          },
          {
            ripImovel: {
              in: data.predios.map((predio) => predio.rip)
              // in: ['1761.00464.500-8']
            }
          }
        ]
      }
    });

    // Get or Create Unidade Requisitante and Unidade Custo
    const unidadeRequisitanteInfo =
      await this.unidadesService.getOrCreateUnidadeByNome(
        data.nomeUnidadeRequisitante,
        'requisitante'
      );
    if (unidadeRequisitanteInfo) {
      data.unidadeRequisitante = { id: unidadeRequisitanteInfo.id };
    }

    const unidadeCustoInfo =
      await this.unidadesService.getOrCreateUnidadeByNome(
        data.nomeUnidadeDeCusto,
        'custo'
      );
    if (unidadeCustoInfo) {
      data.unidadeCusto = { id: unidadeCustoInfo.id };
    }

    const { prismaInput: prismaCreateInput, relationsToInclude } =
      this.processRequisicaoManutencaoData(
        data,
        relationalKeysFromDMMF,
        prediosSubrips,
        unidadeRequisitanteInfo?.id,
        unidadeCustoInfo?.id
      );

    try {
      this.logger.log(
        `Iniciando transação para criar requisição de manutenção...`
      );

      this.logger.log(`Persistindo a criação da requisição de manutenção...`);

      const createdRequisicaoMaterial = await this.prisma.$transaction(
        async (prisma) => {
          const created = await prisma.sipacRequisicaoManutencao.create({
            data: prismaCreateInput as Prisma.SipacRequisicaoManutencaoCreateInput,
            include: {
              historico: true,
              informacoesServico: true,
              requisicoesMateriais: true,
              predios: true,
              requisicaoManutencaoMae: true,
              requisicoesManutencaoFilhas: true,
              unidadeCusto: true,
              unidadeRequisitante: true
            }
          });

          this.logger.log(`Sincronizando com MaintenanceRequest...`);

          await this.syncMaintenanceRequest(created);

          return created;
        }
      );

      //antes de retornar o resultado é importante criar as requisicoes de manutencao filhas.
      //pensando melhor, não dá certo, gera inconsistência. É melhor engatilhar só com a mãe. fiz os teste tentando a req. 631/2024 e ela da certo mas tem inconsistencia
      // await this.ensureRequisicoesFilhasExistentes(
      //   data.requisicoesManutencaoFilhas
      // );

      this.logger.log(
        `Transação de criação de requisição de manutenção concluída.`
      );
      return createdRequisicaoMaterial;
    } catch (error) {
      handlePrismaError(error, this.logger, 'Requisição de Manutenção SIPAC', {
        operation: 'create',
        data
      });
      throw error;
    }
  }
  private async persistUpdateRequisicaoManutencao(
    id: number,
    data: CreateSipacRequisicaoManutencaoCompletoDto
  ) {
    const sipacRequisicaoManutencaoModel = Prisma.dmmf.datamodel.models.find(
      (model) => model.name === 'SipacRequisicaoManutencao'
    );

    let relationalKeysFromDMMF: string[] = [];

    if (sipacRequisicaoManutencaoModel) {
      relationalKeysFromDMMF = sipacRequisicaoManutencaoModel.fields
        .filter((field) => field.kind === 'object' && field.relationName)
        .map((field) => field.name);
    } else {
      this.logger.error(
        'Modelo SipacRequisicaoManutencao não encontrado no DMMF.'
      );
    }

    // Ensure requisicoe mae existe no banco de dados se vier no dto
    if (data.requisicaoManutencaoMae) {
      await this.ensureRequisicaoMaeExistente(data.requisicaoManutencaoMae);
    }

    // Ensure requisicoes de materials referenced in requisition items exist
    if (
      data.requisicoesMateriais &&
      data.requisicoesMateriais.length > 0 &&
      this.requisicoesMateriaisService
    ) {
      const requisicoesParaVerificar = data.requisicoesMateriais.map(
        (requisicao) => ({
          numeroAno: requisicao.numeroDaRequisicao
        })
      );
      await this.ensureRequisicoesMateriaisAssociadasExistentes(
        requisicoesParaVerificar
      ); // `as any` to simplify, ideally type correctly
    }

    // Find all predios by denominacaoPredio e rip
    const prediosSubrips = await this.prisma.sipacPredio.findMany({
      select: {
        subRip: true
      },
      where: {
        AND: [
          {
            denominacaoPredio: {
              in: data.predios.map((predio) => normalizeString(predio.predio))
            }
          },
          {
            ripImovel: {
              in: data.predios.map((predio) => predio.rip)
              // in: ['1761.00464.500-8']
            }
          }
        ]
      }
    });

    // Get or Create Unidade Requisitante and Unidade Custo
    // Note: For updates, if nomeUnidadeRequisitante/DeCusto is not provided in `data`,
    // we might want to preserve the existing one or disconnect if explicitly set to null.
    // This logic assumes if `nomeUnidade...` is in `data`, we try to get/create and connect.
    if (data.hasOwnProperty('nomeUnidadeRequisitante')) {
      const unidadeRequisitanteInfo =
        await this.unidadesService.getOrCreateUnidadeByNome(
          data.nomeUnidadeRequisitante,
          'requisitante'
        );
      data.unidadeRequisitante = unidadeRequisitanteInfo
        ? { id: unidadeRequisitanteInfo.id }
        : null;
    }

    if (data.hasOwnProperty('nomeUnidadeDeCusto')) {
      const unidadeCustoInfo =
        await this.unidadesService.getOrCreateUnidadeByNome(
          data.nomeUnidadeDeCusto,
          'custo'
        );
      data.unidadeCusto = unidadeCustoInfo ? { id: unidadeCustoInfo.id } : null;
    }

    const { prismaInput: prismaUpdateInput, relationsToInclude } =
      this.processRequisicaoManutencaoData(
        data,
        relationalKeysFromDMMF,
        prediosSubrips
      );

    // Check if there are any actual updates to scalar fields or if relational fields have non-empty arrays
    const hasScalarUpdates = Object.keys(prismaUpdateInput).some((key) =>
      Object.values(Prisma.SipacRequisicaoManutencaoScalarFieldEnum).includes(
        key as Prisma.SipacRequisicaoManutencaoScalarFieldEnum
      )
    );

    const hasRelationalUpdates = Object.keys(prismaUpdateInput).some(
      (key) =>
        relationalKeysFromDMMF.includes(key) &&
        Array.isArray((prismaUpdateInput as any)[key]?.create) &&
        ((prismaUpdateInput as any)[key]?.create as any[]).length > 0
    );

    if (!hasScalarUpdates && !hasRelationalUpdates) {
      this.logger.warn(
        `Nenhuma alteração fornecida para a requisição de manutenção ID: ${id}. Retornando dados existentes.`
      );
      const existingRequisicaoManutencao =
        await this.prisma.sipacRequisicaoManutencao.findUnique({
          where: { id },
          // Include relations that could have been updated, even if they weren't
          include: relationalKeysFromDMMF.reduce((acc, key) => {
            (acc as any)[key as string] = true;
            return acc;
          }, {} as Prisma.SipacRequisicaoManutencaoInclude)
        });
      if (!existingRequisicaoManutencao) {
        throw new NotFoundException(
          `Requisição de manutenção com ID ${id} não encontrada.`
        );
      }
      return existingRequisicaoManutencao;
    }

    // For update, explicitly handle deletion of existing relational items before creating new ones
    for (const key of relationalKeysFromDMMF) {
      if (
        (prismaUpdateInput as any)[key] &&
        Array.isArray((prismaUpdateInput as any)[key].create)
      ) {
        (prismaUpdateInput as any)[key] = {
          deleteMany: {}, // Delete all existing items
          create: (prismaUpdateInput as any)[key].create // Create the new items
        };
      } else if (
        (prismaUpdateInput as any)[key] &&
        typeof (prismaUpdateInput as any)[key].create === 'object' &&
        (key === 'requisicaoManutencaoMae' ||
          key === 'unidadeRequisitante' ||
          key === 'unidadeCusto')
      ) {
        // For single object relations that are being updated, delete the old one first
        (prismaUpdateInput as any)[key] = {
          disconnect: true, // Disconnect the old relation
          create: (prismaUpdateInput as any)[key].create // Create the new one
        };
      }
    }

    try {
      this.logger.log(
        `Iniciando transação para atualizar requisição de material...`
      );

      this.logger.log(
        `Persistindo a atualização da requisição de manutenção...`
      );
      const updatedRequisicaoMaintenance = await this.prisma.$transaction(
        async (prisma) => {
          const updated = await prisma.sipacRequisicaoManutencao.update({
            where: { id },
            data: prismaUpdateInput as Prisma.SipacRequisicaoManutencaoUpdateInput,
            include:
              Object.keys(relationsToInclude).length > 0
                ? relationsToInclude
                : undefined
          });

          await this.syncMaintenanceRequest(updated);

          return updated;
        }
      );

      //antes de retornar o resultado é importante criar as requisicoes de manutencao filhas.
      //pensando melhor, não dá certo, gera inconsistência. É melhor engatilhar só com a mãe. fiz os teste tentando a req. 631/2024 e ela da certo mas tem inconsistencia
      // await this.ensureRequisicoesFilhasExistentes(
      //   data.requisicoesManutencaoFilhas
      // );

      this.logger.log(
        `Transação de atualização de requisição de manutenção concluída.`
      );
      return updatedRequisicaoMaintenance;
    } catch (error) {
      handlePrismaError(error, this.logger, 'Requisição de Manutenção SIPAC', {
        operation: 'update',
        id: id,
        data
      });
      throw error;
    }
  }

  // TODO: Determine if ensureMateriaisExistentes is needed and adapt it
  // private async ensureMateriaisExistentes(
  //   itensRequisicao: Array<{ codigo: string; [key: string]: any }>
  // ): Promise<void> {
  //   if (!itensRequisicao || itensRequisicao.length === 0) {
  //     return;
  //   }

  //   this.logger.log(
  //     `Verificando a necessidade de cadastrar materiais da requisição que ainda não existam no banco de dados.`
  //   );

  //   const codigos = itensRequisicao.map((item) => item.codigo);

  //   const registeredItems = await this.prisma.sipacMaterial.findMany({
  //     where: { codigo: { in: codigos } },
  //     select: { codigo: true }
  //   });

  //   const codigosEncontrados = registeredItems.map(
  //     (register) => register.codigo
  //   );

  //   const codigosNaoEncontrados = codigos.filter(
  //     (codigo) => !codigosEncontrados.includes(codigo)
  //   );

  //   if (codigosNaoEncontrados.length > 0) {
  //     this.logger.warn(
  //       `Códigos ausentes: ${codigosNaoEncontrados.join(', ')}. Cadastrando...`
  //     );
  //     await this.materiaisService.fetchManyByCodesAndPersistMaterials(
  //       codigosNaoEncontrados
  //     );
  //   }
  // }

  /**
   * Busca e persiste os detalhes de uma requisição de manutenção específica da API do SIPAC.
   * @param id O ID da requisição de manutenção a ser buscada e atualizada.
   * @returns A resposta paginada da API do SIPAC contendo as requisições de manutenções.
   */
  async fetchAndPersistUpdateRequisicaoManutencao(id: number) {
    this.logger.log(
      `Iniciando busca e persistência da requisição de manutenção do SIPAC com ID: ${id}...`
    );
    try {
      const updateDtoFormat = await this.fetchAndReturnRequisicaoManutencao(id);

      const updateRequisicaoManutencao =
        await this.persistUpdateRequisicaoManutencao(id, updateDtoFormat);

      this.logger.log(
        `Persistência da requisição de manutenção do SIPAC com ID: ${id} concluída com sucesso.`
      );

      return updateRequisicaoManutencao;
    } catch (error) {
      this.logger.error(
        `Erro durante a busca e persistência da requisição de manutenção do SIPAC com ID: ${id}.`,
        error.stack
      );
      throw error;
    }
  }

  async fetchAndReturnRequisicaoManutencao(id: number) {
    this.logger.log(
      `Iniciando busca da requisição de manutenção do SIPAC com ID: ${id}...`
    );
    try {
      const request = await this.sipacScraping.get<
        SipacSingleScrapingResponse<SipacRequisicaoManutencaoResponseItem>
      >(this.URL_PATH, {
        ...this.CONSTANT_PARAMS,
        id
      });
      const { data } = request;

      //inserindo o id
      data.data.dadosDaRequisicao.detalhesAninhados.id = id;

      this.logger.log(
        `Busca da requisição de manutenção do SIPAC com ID: ${id} concluída com sucesso.`
      );

      // The response structure for maintenance is different from material.
      // The mapper should handle the transformation.
      const requisicaoManutencaoDtoFormat: CreateSipacRequisicaoManutencaoCompletoDto =
        SipacRequisicaoManutencaoMapper.toCreateDto(data.data);

      this.logger.log(
        `Retornando requisição de manutenção do SIPAC com ID: ${id}`
      );

      return requisicaoManutencaoDtoFormat;
    } catch (error) {
      this.logger.error(
        `Erro durante a busca e persistência da requisição de manutenção do SIPAC com ID: ${id}.`,
        error.stack
      );
      throw error;
    }
  }

  async fetchByNumeroAnoAndReturnRequisicaoManutencaoComplete(
    numeroAno: string
  ) {
    // First, fetch the list item to get the ID
    const infoFromList =
      await this.listaRequisicoesManutencoesService.fetchByNumeroAnoAndReturnListaRequisicaoManutencao(
        numeroAno
      );

    if (!infoFromList || !infoFromList.id) {
      throw new NotFoundException(
        `Requisição de manutenção com número/ano ${numeroAno} não encontrada na lista.`
      );
    }

    // Then, fetch the detailed item using the ID
    const infoFromDetail = await this.fetchAndReturnRequisicaoManutencao(
      infoFromList.id
    );

    // Combine information if necessary, although the detailed response should be comprehensive
    const infoComplete = {
      ...infoFromDetail,
      id: infoFromList.id,
      usuarioGravacao: infoFromList.usuarioGravacao
    }; // May contain some overlapping fields, decide which source is authoritative

    return infoComplete; // The detailed response should be sufficient
  }

  async fetchCompleteAndPersistCreateOrUpdateRequisicaoManutencao(
    numeroAno: string
  ) {
    {
      // Check if a requisition with this numeroAno already exists in the database
      const exists = await this.prisma.sipacRequisicaoManutencao.findFirst({
        where: {
          // Assuming 'numeroRequisicao' is the field storing the numero/ano in the DB
          numeroRequisicao: numeroAno
        }
      });

      if (exists) {
        this.logger.log(`A requisição de manutenção já existe. Atualizando...`);
        // Fetch the latest detailed data and update the existing record
        const newData = await this.fetchAndReturnRequisicaoManutencao(
          exists.id
        );
        return await this.persistUpdateRequisicaoManutencao(exists.id, newData);
      } else {
        this.logger.log(`A requisição de manutenção não existe. Criando...`);
        // Fetch the complete data (including ID from list) and create a new record
        const createData =
          await this.fetchByNumeroAnoAndReturnRequisicaoManutencaoComplete(
            numeroAno
          );
        return await this.persistCreateRequisicaoManutencao(createData);
      }
    }
  }

  async list() {
    // TODO: Adjust include based on SipacRequisicaoManutencao model relations
    return await this.prisma.sipacRequisicaoManutencao.findMany({
      include: {
        // Example: include nested data if needed for listing
        // informacoesDoServico: true,
        // requisicoesDeManutencaoAssociadas: true,
        // requisicoesAssociadasDeMateriais: {
        //   include: {
        //     itens: {
        //       include: {
        //         material: true // If SipacItemRequisicaoMaterial links to SipacMaterial
        //       }
        //     }
        //   }
        // },
        // imoveisPrediosInseridos: true,
        // historico: true,
        historico: true,
        informacoesServico: true,
        requisicoesMateriais: true,
        predios: true,
        requisicaoManutencaoMae: true,
        requisicoesManutencaoFilhas: true,
        unidadeCusto: true,
        unidadeRequisitante: true
      }
    });
  }

  async fetchCompleteAndPersistCreateOrUpdateRequisicaoManutencaoArray(
    numeroAnoArray: string[]
  ): Promise<{
    summary: { totalProcessed: number; successful: number; failed: number };
    details: ProcessNumeroAnoResult[];
  }> {
    const results: ProcessNumeroAnoResult[] = [];
    let successfulCount = 0;
    let failedCount = 0;

    for (const numeroAno of numeroAnoArray) {
      try {
        await this.fetchCompleteAndPersistCreateOrUpdateRequisicaoManutencao(
          numeroAno
        );
        results.push({ numeroAno, status: 'success' });
        successfulCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';
        this.logger.error(
          `Falha ao processar requisição de manutenção com numeroAno: ${numeroAno}. Erro: ${errorMessage}`
        );
        results.push({ numeroAno, status: 'failed', message: errorMessage });
        failedCount++;
      }
    }

    return {
      summary: {
        totalProcessed: numeroAnoArray.length,
        successful: successfulCount,
        failed: failedCount
      },
      details: results
    };
  }

  private async ensureRequisicoesMateriaisAssociadasExistentes(
    requisicoesAssociadas: Array<{ numeroAno: string; [key: string]: any }>
  ): Promise<void> {
    if (!requisicoesAssociadas || requisicoesAssociadas.length === 0) {
      return;
    }

    this.logger.log(
      `Verificando a necessidade de cadastrar requisições de materiais que ainda não existam no banco de dados.`
    );

    const requisicoesMateriaisNumerosAnos = requisicoesAssociadas.map(
      (requisicao) => requisicao.numeroAno
    );

    const registeredRequisicoes =
      await this.prisma.sipacRequisicaoMaterial.findMany({
        where: { numeroDaRequisicao: { in: requisicoesMateriaisNumerosAnos } },
        select: { numeroDaRequisicao: true }
      });

    const numerosAnosEncontrados = registeredRequisicoes.map(
      (register) => register.numeroDaRequisicao
    );

    const numerosAnosNaoEncontrados = requisicoesMateriaisNumerosAnos.filter(
      (numeroAno) => !numerosAnosEncontrados.includes(numeroAno)
    );

    if (numerosAnosNaoEncontrados.length > 0) {
      this.logger.warn(
        `Requisicoes de materiais ausentes: ${numerosAnosNaoEncontrados.join(', ')}. Cadastrando...`
      );
      await this.requisicoesMateriaisService.fetchCompleteAndPersistCreateOrUpdateRequisicaoMaterialArray(
        numerosAnosNaoEncontrados
      );
    }
  }

  private async ensureRequisicaoMaeExistente(
    requisicaoMae: SipacRequisicaoManutencaoMaeAssociadaDto
  ) {
    this.logger.log(
      `Verificando a necessidade de cadastrar requisição mãe que ainda não existam no banco de dados.`
    );

    const registeredRequisicao =
      await this.prisma.sipacRequisicaoManutencao.findUnique({
        where: { id: requisicaoMae.id },
        select: { numeroRequisicao: true }
      });

    if (registeredRequisicao) {
      this.logger.log(`Requisição mãe já encontrada, apenas conectar`);
    } else {
      this.logger.warn(`Requisição mãe não encontrada. Cadastrando...`);
      await this.fetchCompleteAndPersistCreateOrUpdateRequisicaoManutencao(
        requisicaoMae.numeroAno
      );
    }
  }

  //não utilizei pq gera inconsistência. Deixar apenas o método ensureRequisicaoMaeExistente ativo
  private async ensureRequisicoesFilhasExistentes(
    requisicoesFilhas: SipacRequisicaoManutencaoMaeAssociadaDto[]
  ) {
    if (!requisicoesFilhas || requisicoesFilhas.length === 0) {
      return;
    }
    this.logger.log(
      `Verificando a necessidade de cadastrar requisições de manutenção filhas que ainda não existam no banco de dados.`
    );

    const requisicoesFilhasNumerosAnos = requisicoesFilhas.map(
      (requisicao) => requisicao.numeroAno
    );

    const registeredRequisicoes =
      await this.prisma.sipacRequisicaoManutencao.findMany({
        where: { numeroRequisicao: { in: requisicoesFilhasNumerosAnos } },
        select: { numeroRequisicao: true }
      });

    const numerosAnosEncontrados = registeredRequisicoes.map(
      (register) => register.numeroRequisicao
    );

    const numerosAnosNaoEncontrados = requisicoesFilhasNumerosAnos.filter(
      (numeroAno) => !numerosAnosEncontrados.includes(numeroAno)
    );

    if (numerosAnosNaoEncontrados.length > 0) {
      this.logger.warn(
        `Requisicoes de manutenção filhas ausentes: ${numerosAnosNaoEncontrados.join(', ')}. Cadastrando...`
      );
      await this.fetchCompleteAndPersistCreateOrUpdateRequisicaoManutencaoArray(
        numerosAnosNaoEncontrados
      );
    }
  }

  // New method to sync with MaintenanceRequestsService
  private async syncMaintenanceRequest(
    sipacRequisicaoManutencao: Prisma.SipacRequisicaoManutencaoGetPayload<{
      include: {
        predios: true;
        requisicoesMateriais: true;
        unidadeCusto: true;
        unidadeRequisitante: true;
        historico: true;
      };
    }>
  ): Promise<void> {
    const maintenanceRequestDto: CreateMaintenanceRequestWithRelationsDto =
      MaintenanceRequestMapper.toCreateDto(sipacRequisicaoManutencao);
    try {
      // Assuming protocolNumber in MaintenanceRequest stores the SIPAC request ID
      const existingMaitenanceRequest =
        await this.maintenanceRequestsService.findByProtocolNumber(
          sipacRequisicaoManutencao.numeroRequisicao
        );

      if (existingMaitenanceRequest) {
        this.logger.log(
          `Updating MaintenanceRequest for SIPAC ID: ${sipacRequisicaoManutencao.numeroRequisicao}`
        );

        await this.maintenanceRequestsService.update(
          existingMaitenanceRequest.id,
          maintenanceRequestDto
        );
      }
      return;
    } catch (error) {
      //Esse erro é porque não existe, então a gente deve criar.
      if (error instanceof NotFoundException) {
        if (error.getStatus() === 404) {
          this.logger.log(
            `Creating MaintenanceRequest for SIPAC ID: ${sipacRequisicaoManutencao.numeroRequisicao}`
          );
          await this.maintenanceRequestsService.create(maintenanceRequestDto);
          return;
        }
      }

      this.logger.error(
        `Failed to sync MaintenanceRequest for SIPAC ID: ${sipacRequisicaoManutencao.numeroRequisicao}`,
        error.stack
      );
      // Relança o erro para garantir que a transação pai seja revertida.
      throw error;
    }
  }
}

export interface ProcessNumeroAnoResult {
  numeroAno: string;
  status: 'success' | 'failed';
  message?: string;
}
