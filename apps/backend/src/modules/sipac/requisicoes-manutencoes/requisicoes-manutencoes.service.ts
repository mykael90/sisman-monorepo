import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
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
// import { MateriaisService } from '../materiais/materiais.service'; // TODO: Determine if MateriaisService is needed

@Injectable()
export class RequisicoesManutencoesService {
  private readonly logger = new Logger(RequisicoesManutencoesService.name);
  private readonly URL_PATH = 'sipac/requisicao/manutencao'; // TODO: Confirm the actual API path

  // Constant query parameters - TODO: Confirm these for maintenance requisitions
  private readonly CONSTANT_PARAMS = {
    // acao: 200 // Assuming a similar action parameter
    // Add other necessary constant params for maintenance requisitions
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly listaRequisicoesManutencoesService: ListaRequisicoesManutencoesService,
    // private readonly materiaisService: MateriaisService, // TODO: Determine if MateriaisService is needed
    private readonly sipacScraping: SipacScrapingService,
    private readonly requisicoesMateriaisService: RequisicoesMateriaisService
  ) {}

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
    const sipacRequisicaoManutencaoModel = Prisma.dmmf.datamodel.models.find(
      (model) => model.name === 'SipacRequisicaoManutencao'
    );

    // this.logger.log(data);

    let relationalKeysFromDMMF: string[] = [];
    const relationsToInclude: Prisma.SipacRequisicaoManutencaoInclude = {};

    if (sipacRequisicaoManutencaoModel) {
      relationalKeysFromDMMF = sipacRequisicaoManutencaoModel.fields
        .filter((field) => field.kind === 'object' && field.relationName)
        .map((field) => field.name);
    } else {
      this.logger.error(
        'Modelo SipacRequisicaoManutencao não encontrado no DMMF.'
      );
    }

    const prismaCreateInput = {};

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
              in: data.predios.map(
                (predio) => removeAccentsAndSpecialChars(predio).predio
              )
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

    //

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const typedKey =
          key as keyof CreateSipacRequisicaoManutencaoCompletoDto;
        const value = data[typedKey];

        if (relationalKeysFromDMMF.includes(typedKey)) {
          // If it's a relational field, wrap in 'create' or 'createMany'
          if (Array.isArray(value)) {
            if (typedKey === 'requisicoesMateriais') {
              (prismaCreateInput as any)[typedKey] = {
                connect: value.map((item: any) => ({
                  // Remove the foreign key from the item data as it will be set by createMany
                  id: item.id
                }))
              };
            } else if (typedKey === 'predios') {
              (prismaCreateInput as any)[typedKey] = {
                connect: prediosSubrips
              };
            } else if (typedKey === 'requisicoesManutencaoFilhas') {
              //não faça nada, vai ter uma lógica no final para criar as requisições filhas.
            } else {
              (prismaCreateInput as any)[typedKey] = {
                // deleteMany: {}, // Delete all existing items (apenas no update)
                create: value // Create the new items
              };
            }
            (relationsToInclude as any)[typedKey] = true;
          } else if (value !== null && typeof value === 'object') {
            // Handle single nested object relations (e.g., dadosDaRequisicao)
            if (typedKey === 'requisicaoManutencaoMae') {
              // connect requisicao mae
              // Check if value is indeed a SipacRequisicaoManutencaoMaeAssociadaDto
              if (value && 'id' in value && typeof value.id === 'number') {
                (prismaCreateInput as any)[typedKey] = {
                  connect: {
                    // Assuming 'id' is the unique identifier for SipacRequisicaoManutencao
                    id: value.id
                  }
                };
                // }
              } else {
                (prismaCreateInput as any)[typedKey] = {
                  // delete: value,
                  create: value
                };
              }
            }
            (relationsToInclude as any)[typedKey] = true;
          }
        } else {
          // Assume it's a scalar field and assign directly
          (prismaCreateInput as any)[typedKey] = value;
        }
      }
    }

    try {
      this.logger.log(`Persistindo a criação da requisição de manutenção...`);
      const result = await this.prisma.sipacRequisicaoManutencao.create({
        data: { ...(prismaCreateInput as any) },
        include:
          Object.keys(relationsToInclude).length > 0
            ? relationsToInclude
            : undefined
      });

      //antes de retornar o resultado é importante criar as requisicoes de manutencao filhas.
      //pensando melhor, não dá certo, gera inconsistência. É melhor engatilhar só com a mãe. fiz os teste tentando a req. 631/2024 e ela da certo mas tem inconsistencia
      // await this.ensureRequisicoesFilhasExistentes(
      //   data.requisicoesManutencaoFilhas
      // );

      return result;
      // return prismaCreateInput;
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
    data: UpdateSipacRequisicaoManutencaoDto
  ) {
    const sipacRequisicaoManutencaoModel = Prisma.dmmf.datamodel.models.find(
      (model) => model.name === 'SipacRequisicaoManutencao'
    );

    let relationalKeysFromDMMF: string[] = [];
    const prismaUpdateInput: Prisma.SipacRequisicaoManutencaoUpdateInput = {};
    const relationsToInclude: Prisma.SipacRequisicaoManutencaoInclude = {};
    let hasUpdates = false;

    if (sipacRequisicaoManutencaoModel) {
      // Before processing updates, ensure materials for items exist if MateriaisService is used
      // if (data.itensDaRequisicao && data.itensDaRequisicao.length > 0 && this.materiaisService) {
      //   const itensParaVerificar = data.itensDaRequisicao.map((item) => ({
      //     codigo: item.codigo // Assuming the DTO has 'codigo' in items
      //   }));
      //   await this.materiaisService.ensureMateriaisExistentes(itensParaVerificar as any); // `as any` to simplify, ideally type correctly
      // }
      relationalKeysFromDMMF = sipacRequisicaoManutencaoModel.fields
        .filter((field) => field.kind === 'object' && field.relationName) // Filter only fields that are objects (other models) and have a relation name
        .map((field) => field.name);
    } else {
      this.logger.error(
        'Modelo SipacRequisicaoManutencao não encontrado no DMMF.'
      );
    }

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const typedKey =
          key as keyof Prisma.SipacRequisicaoManutencaoUpdateInput;
        const value = data[typedKey];

        if (value === undefined) {
          // 'undefined' means "do not change this field"
          continue;
        }
        hasUpdates = true;

        // 2. Check if the key is a relation to define with 'set' or 'createMany'/'updateMany'/'deleteMany'
        if (relationalKeysFromDMMF.includes(typedKey)) {
          if (Array.isArray(value)) {
            // Handle array relations (e.g., items, history, etc.)
            // This assumes a pattern where existing related records are deleted and new ones created.
            // A more robust approach might involve checking for existing records and updating/deleting selectively.
            // For simplicity, using deleteMany and createMany as a starting point.
            (prismaUpdateInput as any)[typedKey] = {
              deleteMany: {}, // Delete all existing related records
              createMany: {
                data: value.map((item: any) => {
                  // Remove the foreign key from the item data as it will be set by createMany
                  const { requisicaoManutencaoId, ...itemData } = item;
                  return itemData;
                }),
                skipDuplicates: true // Optional: skip if a unique constraint would be violated
              }
            };
            (relationsToInclude as any)[typedKey] = true;
          } else if (value !== null && typeof value === 'object') {
            // Handle single nested object relations if any (e.g., dadosDaRequisicao)
            // This assumes the nested object should be updated or created if it doesn't exist.
            (prismaUpdateInput as any)[typedKey] = {
              upsert: {
                // Use upsert for single nested objects
                create: value,
                update: value,
                where: {
                  /* Add a unique identifier for the nested object if available */
                } // TODO: Add where clause if needed
              }
            };
            (relationsToInclude as any)[typedKey] = true;
          }
        } else if (
          Object.values(
            Prisma.SipacRequisicaoManutencaoScalarFieldEnum
          ).includes(
            typedKey as Prisma.SipacRequisicaoManutencaoScalarFieldEnum
          )
        ) {
          // It's a valid scalar field for the SipacRequisicaoManutencao model
          (prismaUpdateInput as any)[typedKey] = value;
        }
      }
    }

    if (!hasUpdates && Object.keys(prismaUpdateInput).length === 0) {
      // Check also if prismaUpdateInput is actually empty, in case all values
      // were undefined, but some relational key with empty array was processed.
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

    try {
      this.logger.log(
        `Persistindo a atualização de requisição de manutenção...`
      );
      return await this.prisma.sipacRequisicaoManutencao.update({
        where: { id },
        data: prismaUpdateInput,
        //to have relations in the return
        include:
          Object.keys(relationsToInclude).length > 0
            ? relationsToInclude
            : undefined
      });
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
      const updateDtoFormat: UpdateSipacRequisicaoManutencaoDto =
        await this.fetchAndReturnRequisicaoManutencao(id);

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
        requisicoesManutencaoFilhas: true
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
}

export interface ProcessNumeroAnoResult {
  numeroAno: string;
  status: 'success' | 'failed';
  message?: string;
}
