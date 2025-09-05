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
import { Prisma, SipacRequisicaoMaterial } from '@sisman/prisma';
import { SipacScrapingService } from '../sipac-scraping.service';
import {
  SipacListaRequisicaoMaterialResponseItem,
  SipacPaginatedScrapingResponse,
  SipacRequisicaoMaterialResponseItem,
  SipacSingleScrapingResponse,
  SyncResult,
  SipacItemDaRequisicaoMaterial
} from '../sipac-scraping.interfaces';
import {
  CreateManySipacListaRequisicaoMaterialDto as CreateManySipacRequisicaoMaterialDto,
  CreateSipacListaRequisicaoMaterialDto,
  CreateSipacRequisicaoMaterialCompletoDto,
  UpdateSipacRequisicaoMaterialDto
} from './dto/sipac-requisicao-material.dto';
import {
  SipacListaRequisicaoMaterialMapper,
  SipacRequisicaoMaterialMapper
} from './mappers/sipac-requisicao-material.mapper';
import { MaterialRequestMapper } from 'src/modules/material-requests/mappers/materials-request.mapper';
import { AxiosRequestConfig } from 'axios';
import { handlePrismaError } from '../../../shared/utils/prisma-error-handler';
import { ListaRequisicoesMateriaisService } from './lista-requisicoes-materiais.service';
import { MateriaisService } from '../materiais/materiais.service';
import { MaterialRequestsService } from 'src/modules/material-requests/material-requests.service';
import { UnidadesService } from '../unidades/unidades.service';
import { Decimal } from '@sisman/prisma/generated/client/runtime/library';
import { normalizeString } from '../../../shared/utils/string-utils';

@Injectable()
export class RequisicoesMateriaisService {
  private readonly logger = new Logger(RequisicoesMateriaisService.name);
  private readonly URL_PATH = 'sipac/requisicao/material';

  // Constant query parameters
  private readonly CONSTANT_PARAMS = {
    acao: 200
  };

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly listaRequisicoesMateriaisService: ListaRequisicoesMateriaisService,
    private readonly materiaisService: MateriaisService,
    private readonly sipacScraping: SipacScrapingService,
    private readonly materialRequestsService: MaterialRequestsService,
    private readonly unidadesService: UnidadesService
  ) {}

  //método compartilhado com lógica para processar os dados a serem criados ou atualizados no banco
  private processRequisicaoMaterialData<T extends object>(
    data: T,
    relationalKeysFromDMMF: string[],
    unidadeRequisitanteId?: number,
    unidadeCustoId?: number
  ): {
    prismaInput:
      | Prisma.SipacRequisicaoMaterialCreateInput
      | Prisma.SipacRequisicaoMaterialUpdateInput;
    relationsToInclude: Prisma.SipacRequisicaoMaterialInclude;
  } {
    const prismaInput: any = {};
    const relationsToInclude: Prisma.SipacRequisicaoMaterialInclude = {};

    if (unidadeRequisitanteId) {
      prismaInput.unidadeRequisitante = {
        connect: { id: unidadeRequisitanteId }
      };
    }

    if (unidadeCustoId) {
      prismaInput.unidadeCusto = {
        connect: { id: unidadeCustoId }
      };
    }

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const typedKey = key as keyof T;
        const value = data[typedKey];

        if (value === undefined) {
          // 'undefined' means "do not alter this field" for updates
          continue;
        }

        if (
          typedKey === 'unidadeRequisitanteId' ||
          typedKey === 'unidadeCustoId'
        ) {
          continue;
        }

        if (
          relationalKeysFromDMMF.includes(key) &&
          Array.isArray(value) // 'value' should be an array (can be empty to remove all connections)
        ) {
          // Use 'create' for creating new connections
          prismaInput[key] = {
            create: value
          };
          (relationsToInclude as any)[key] = true;
        } else if (
          Object.values(Prisma.SipacRequisicaoMaterialScalarFieldEnum).includes(
            key as Prisma.SipacRequisicaoMaterialScalarFieldEnum
          )
        ) {
          // It's a valid scalar field for the model
          //TODO:  include this in others services
          if (value === null) {
            continue; // Skip null scalar values
          }
          prismaInput[key] = value;
        } else if (
          relationalKeysFromDMMF.includes(key) &&
          value !== null &&
          typeof value === 'object'
        ) {
          // Handle single nested object relations
          if (
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
      }
    }

    return { prismaInput, relationsToInclude };
  }

  // New method to sync with MaterialRequestsService
  private async syncMaterialRequest(
    sipacRequisicaoMaterial: Prisma.SipacRequisicaoMaterialGetPayload<{
      include: {
        itensDaRequisicao: true;
        unidadeCusto: true;
        unidadeRequisitante: true;
        historicoDaRequisicao: true;
      };
    }>
  ): Promise<void> {
    const materialRequestDto = MaterialRequestMapper.toCreateDto(
      sipacRequisicaoMaterial
    );

    // Checa inconsistências no status da materialRequestDto.statusHistory,
    // Itens com o mesmo "status" e "changeDate" são considerados duplicados e um deles é excluído.
    if (materialRequestDto.statusHistory) {
      const seen = new Set();
      materialRequestDto.statusHistory =
        materialRequestDto.statusHistory.filter((item) => {
          const duplicateIdentifier = `${
            item.status
          }_${item.changeDate.getTime()}`;
          if (seen.has(duplicateIdentifier)) {
            return false;
          } else {
            seen.add(duplicateIdentifier);
            return true;
          }
        });
    }

    try {
      //verificar se tem requisicao de manutencao vinculada para vincular em materialRequest também
      if (
        sipacRequisicaoMaterial.sipacRequisicaoManutencaoId &&
        sipacRequisicaoMaterial.numeroDaRequisicaoRelacionada
      ) {
        const maintenanceRequest =
          await this.prisma.maintenanceRequest.findUnique({
            select: { id: true },
            where: {
              protocolNumber:
                sipacRequisicaoMaterial.numeroDaRequisicaoRelacionada
            }
          });

        if (maintenanceRequest.id) {
          materialRequestDto.maintenanceRequestId = maintenanceRequest.id;
        }
      }

      // Assuming protocolNumber in MaterialRequest stores the SIPAC request ID
      const existingMaterialRequest =
        await this.materialRequestsService.findByProtocolNumber(
          sipacRequisicaoMaterial.numeroDaRequisicao
        );

      if (existingMaterialRequest) {
        this.logger.log(
          `Updating MaterialRequest for SIPAC ID: ${sipacRequisicaoMaterial.numeroDaRequisicao}`
        );
        await this.materialRequestsService.update(
          existingMaterialRequest.id,
          materialRequestDto
        );
      }
      // else {
      //   this.logger.log(
      //     `Creating MaterialRequest for SIPAC ID: ${sipacRequisicaoMaterial.numeroDaRequisicao}`
      //   );
      //   await this.materialRequestsService.create(materialRequestDto);
      // }
      return;
    } catch (error) {
      //Esse erro é porque não existe, então a gente deve criar.
      if (error instanceof NotFoundException) {
        if (error.getStatus() === 404) {
          this.logger.log(
            `Creating MaterialRequest for SIPAC ID: ${sipacRequisicaoMaterial.numeroDaRequisicao}`
          );
          await this.materialRequestsService.create(materialRequestDto);
          return;
        }
      }

      this.logger.error(
        `Failed to sync MaterialRequest for SIPAC ID: ${sipacRequisicaoMaterial.numeroDaRequisicao}`,
        error.stack
      );
      // Relança o erro para garantir que a transação pai seja revertida.
      throw error;
    }
  }

  // @Cron(
  //   process.env.CRON_SIPAC_REQUISICOES_MATERIAIS_SYNC || '0 0 * * *' // Daily at midnight
  // )
  // async handleCronSyncRequisicoesMateriais() {
  //   this.logger.log(
  //     'Iniciando sincronização agendada de requisições de materiais do SIPAC...'
  //   );
  //   // You'll need to define how to get dataInicial and dataFinal for cron jobs
  //   // For example, sync for the previous day or week.
  //   const result = await this.fetchAllAndPersistRequisicoesMateriais('01/01/2025', '05/01/2025'); // Placeholder dates
  //   this.logger.log(
  //     `Sincronização agendada de requisições de materiais do SIPAC concluída. Total processado: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
  //   );
  // }

  //persiste uma criação
  async persistCreateRequisicaoMateiral(
    data: CreateSipacRequisicaoMaterialCompletoDto
  ) {
    const sipacRequisicaoMaterialModel = Prisma.dmmf.datamodel.models.find(
      (model) => model.name === 'SipacRequisicaoMaterial'
    );

    let relationalKeysFromDMMF: string[] = [];

    if (sipacRequisicaoMaterialModel) {
      relationalKeysFromDMMF = sipacRequisicaoMaterialModel.fields
        .filter((field) => field.kind === 'object' && field.relationName)
        .map((field) => field.name);
    } else {
      this.logger.error(
        'Modelo SipacRequisicaoMaterial não encontrado no DMMF.'
      );
    }

    // Antes de processar as criações, garantir que os materiais dos itens existem
    if (data.itensDaRequisicao && data.itensDaRequisicao.length > 0) {
      const itensParaVerificar = data.itensDaRequisicao.map((item) => ({
        codigo: item.codigo, // Supondo que o DTO de update tenha `codigo` nos itens
        valor: item.valor,
        denominacao: item.denominacao
      }));
      await this.ensureMateriaisExistentesAtualizados(
        itensParaVerificar as any
      ); // `as any` para simplificar, idealmente tipar corretamente
    }

    // remover a chave 'denominacao' dos items da requisicao, nao pode ir para o banco de dados, é só para verificar consistencia
    data.itensDaRequisicao.forEach((item) => {
      delete item.denominacao;
    });

    // Get or Create Unidade Requisitante and Unidade Custo
    const unidadeRequisitanteInfo =
      await this.unidadesService.getOrCreateUnidadeBySigla(
        data.siglaUnidadeRequisitante,
        'requisitante'
      );
    if (unidadeRequisitanteInfo) {
      data.unidadeRequisitante = { id: unidadeRequisitanteInfo.id };
    }

    const unidadeCustoInfo =
      await this.unidadesService.getOrCreateUnidadeBySigla(
        data.siglaUnidadeDeCusto,
        'custo'
      );
    if (unidadeCustoInfo) {
      data.unidadeCusto = { id: unidadeCustoInfo.id };
    }

    const { prismaInput: prismaCreateInput, relationsToInclude } =
      this.processRequisicaoMaterialData(
        data,
        relationalKeysFromDMMF,
        unidadeRequisitanteInfo?.id,
        unidadeCustoInfo?.id
      );

    try {
      this.logger.log(
        `Iniciando transação para criar requisição de material...`
      );

      this.logger.log(`Persistindo a criação da requisição de material...`);
      const createdRequisicaoMaterial = await this.prisma.$transaction(
        async (prisma) => {
          const created = await prisma.sipacRequisicaoMaterial.create({
            data: prismaCreateInput as Prisma.SipacRequisicaoMaterialCreateInput,
            include: {
              // Explicitly define the required relations
              itensDaRequisicao: true,
              unidadeCusto: true,
              unidadeRequisitante: true,
              historicoDaRequisicao: true
            }
          });

          this.logger.log(`Sincronizando com MaterialRequest...`);
          await this.syncMaterialRequest(created);

          return created;
        }
      );

      this.logger.log(
        `Transação de criação de requisição de material concluída.`
      );
      return createdRequisicaoMaterial;
    } catch (error) {
      handlePrismaError(error, this.logger, 'Requisição de Material SIPAC', {
        operation: 'create (transactional)',
        data
      });
      throw error;
    }
  }

  //persiste uma atualização
  async persistUpdateRequisicaoMaterial(
    id: number,
    data: UpdateSipacRequisicaoMaterialDto
  ) {
    const sipacRequisicaoMaterialModel = Prisma.dmmf.datamodel.models.find(
      (model) => model.name === 'SipacRequisicaoMaterial'
    );

    let relationalKeysFromDMMF: string[] = [];

    if (sipacRequisicaoMaterialModel) {
      relationalKeysFromDMMF = sipacRequisicaoMaterialModel.fields
        .filter((field) => field.kind === 'object' && field.relationName) // Filtra apenas campos que são objetos (outros modelos) e têm um nome de relação
        .map((field) => field.name);
    } else {
      this.logger.error(
        'Modelo SipacRequisicaoMaterial não encontrado no DMMF.'
      );
    }

    // Antes de processar as atualizações, garantir que os materiais dos itens existem
    if (data.itensDaRequisicao && data.itensDaRequisicao.length > 0) {
      const itensParaVerificar = data.itensDaRequisicao.map((item) => ({
        codigo: item.codigo, // Supondo que o DTO de update tenha `codigo` nos itens
        valor: item.valor,
        denominacao: item.denominacao
      }));
      await this.ensureMateriaisExistentesAtualizados(
        itensParaVerificar as any
      ); // `as any` para simplificar, idealmente tipar corretamente
    }

    // remover a chave 'denominacao' dos items da requisicao, nao pode ir para o banco de dados, é só para verificar consistencia
    data.itensDaRequisicao.forEach((item) => {
      delete item.denominacao;
    });

    this.logger.debug(data);

    // Get or Create Unidade Requisitante and Unidade Custo
    // Note: For updates, if nomeUnidadeRequisitante/DeCusto is not provided in `data`,
    // we might want to preserve the existing one or disconnect if explicitly set to null.
    // This logic assumes if `nomeUnidade...` is in `data`, we try to get/create and connect.
    if (data.hasOwnProperty('siglaUnidadeRequisitante')) {
      const unidadeRequisitanteInfo =
        await this.unidadesService.getOrCreateUnidadeBySigla(
          data.siglaUnidadeRequisitante,
          'requisitante'
        );
      data.unidadeRequisitante = unidadeRequisitanteInfo
        ? { id: unidadeRequisitanteInfo.id }
        : null;
    }

    if (data.hasOwnProperty('siglaUnidadeDeCusto')) {
      const unidadeCustoInfo =
        await this.unidadesService.getOrCreateUnidadeBySigla(
          data.siglaUnidadeDeCusto,
          'custo'
        );
      data.unidadeCusto = unidadeCustoInfo ? { id: unidadeCustoInfo.id } : null;
    }

    const { prismaInput: prismaUpdateInput, relationsToInclude } =
      this.processRequisicaoMaterialData(data, relationalKeysFromDMMF);

    // Check if there are any actual updates to scalar fields or if relational fields have non-empty arrays
    const hasScalarUpdates = Object.keys(prismaUpdateInput).some((key) =>
      Object.values(Prisma.SipacRequisicaoMaterialScalarFieldEnum).includes(
        key as Prisma.SipacRequisicaoMaterialScalarFieldEnum
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
        `Nenhuma alteração fornecida para a requisição de material ID: ${id}. Retornando dados existentes.`
      );
      const existingRequisicaoMaterial =
        await this.prisma.sipacRequisicaoMaterial.findUnique({
          where: { id },
          // Inclui as relations that could have been updated, even if they weren't
          include: relationalKeysFromDMMF.reduce((acc, key) => {
            (acc as any)[key as string] = true;
            return acc;
          }, {} as Prisma.SipacRequisicaoMaterialInclude)
        });
      if (!existingRequisicaoMaterial) {
        throw new NotFoundException(
          `Requisição de material com ID ${id} não encontrada.`
        );
      }
      return existingRequisicaoMaterial;
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
      }
    }

    try {
      this.logger.log(
        `Iniciando transação para atualizar requisição de material...`
      );

      this.logger.log(`Persistindo a atualização da requisição de material...`);
      const updatedRequisicaoMaterial = await this.prisma.$transaction(
        async (prisma) => {
          const updated = await prisma.sipacRequisicaoMaterial.update({
            where: { id },
            data: prismaUpdateInput as Prisma.SipacRequisicaoMaterialUpdateInput,
            //para ter as relações no retorno
            include: {
              // Explicitly define the required relations
              itensDaRequisicao: true,
              unidadeCusto: true,
              unidadeRequisitante: true,
              historicoDaRequisicao: true
            }
          });

          await this.syncMaterialRequest(updated);

          return updated;
        }
      );

      this.logger.log(
        `Transação de atualização de requisição de material concluída.`
      );
      return updatedRequisicaoMaterial;
    } catch (error) {
      handlePrismaError(error, this.logger, 'Requisição de Material SIPAC', {
        operation: 'update (transactional)',
        id: id,
        data
      });
      throw error;
    }
  }

  //verifica se todos os materiais relacionados na requisição existem, se não existir, cria
  //os que já existem, atualize com as informações mais recentes
  private async ensureMateriaisExistentesAtualizados(
    itensRequisicao: Array<{
      codigo: string;
      denominacao: string;
      valor: Decimal;
      [key: string]: any;
    }>
  ) {
    try {
      if (!itensRequisicao || itensRequisicao.length === 0) {
        return undefined;
      }

      this.logger.log(
        `Certificando que materials existem e estão atualizados para os codigos fornecidos.`
      );

      const uniqueCodigos = [
        ...new Set(itensRequisicao.map((item) => item.codigo))
      ];

      const registeredItems = await this.prisma.sipacMaterial.findMany({
        where: { codigo: { in: uniqueCodigos } },
        select: { codigo: true, precoCompra: true, denominacaoMaterial: true }
      });
      const codigosEncontrados = registeredItems.map(
        (register) => register.codigo
      );

      const codigosNaoEncontrados = uniqueCodigos.filter(
        (codigo) => !codigosEncontrados.includes(codigo)
      );

      if (codigosNaoEncontrados.length > 0) {
        this.logger.warn(
          `Codes not found locally: ${codigosNaoEncontrados.join(', ')}. Attempting to fetch and persist...`
        );

        await this.materiaisService.fetchManyByCodesAndPersistMaterials(
          codigosNaoEncontrados
        );
      }

      if (codigosEncontrados.length > 0) {
        this.logger.log(
          `Códigos encontrados localmente: ${codigosEncontrados.join(', ')}`
        );

        // antes de chamar o metodo para atualizar, verificar se há necessidade de atualização.
        const registeredItemsMap = new Map(
          registeredItems.map((item) => [item.codigo, item])
        );

        const codigosParaAtualizar = itensRequisicao
          .filter((item) => codigosEncontrados.includes(item.codigo))
          .filter((item) => {
            const itemRegistrado = registeredItemsMap.get(item.codigo);
            if (!itemRegistrado) return false;

            // const precoCompraDB = new Decimal(itemRegistrado.precoCompra);

            return (
              normalizeString(item.denominacao) !==
              normalizeString(itemRegistrado.denominacaoMaterial)
              // || !new Decimal(item.valor).equals(precoCompraDB)
            );
          })
          .map((item) => item.codigo);

        if (codigosParaAtualizar.length > 0) {
          this.logger.log(
            `Materiais que precisam de atualização: ${codigosParaAtualizar.join(
              ', '
            )}`
          );
          return await this.materiaisService.fetchManyByCodesAndPersistMaterials(
            codigosParaAtualizar
          );
        } else {
          this.logger.log(
            'Nenhum dos materiais encontrados localmente precisa de atualização.'
          );
        }
      }

      this.logger.log(`Verificação dos materiais concluída.`);
    } catch (error) {
      this.logger.error(
        `Error processing materials in ensureMateriaisExistentesAtualizados: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Busca e persiste os detalhes de uma requisição de material específica da API do SIPAC.
   * @param id O ID da requisição de material a ser buscada e atualizada.
   * @returns A resposta paginada da API do SIPAC contendo as requisições de materiais.
   */
  async fetchAndPersistUpdateRequisicaoMaterial(id: number) {
    this.logger.log(
      `Iniciando busca e persistência da requisição de material do SIPAC com ID: ${id}...`
    );
    try {
      const updateDtoFormat: UpdateSipacRequisicaoMaterialDto =
        await this.fetchAndReturnRequisicaoMaterial(id);

      const updateRequisicaoMaterial =
        await this.persistUpdateRequisicaoMaterial(id, updateDtoFormat);

      this.logger.log(
        `Persistência da requisição de material do SIPAC com ID: ${id} concluída com sucesso.`
      );

      return updateRequisicaoMaterial;
    } catch (error) {
      this.logger.error(
        `Erro durante a busca e persistência da requisição de material do SIPAC com ID: ${id}.`,
        error.stack
      );
      throw error;
    }
  }

  //só retorna o JSON da requisição de material do SIPAC (busca pelo id), não persiste no banco
  async fetchAndReturnRequisicaoMaterial(id: number) {
    this.logger.log(
      `Iniciando busca da requisição de material do SIPAC com ID: ${id}...`
    );
    try {
      const request = await this.sipacScraping.get<
        SipacSingleScrapingResponse<SipacRequisicaoMaterialResponseItem>
      >(this.URL_PATH, {
        ...this.CONSTANT_PARAMS,
        id,
        requisicao: id
      });
      const { data } = request;
      this.logger.log(
        `Busca da requisição de material do SIPAC com ID: ${id} concluída com sucesso.`
      );

      const result: SipacSingleScrapingResponse<SipacRequisicaoMaterialResponseItem> =
        {
          metadata: data.metadata,
          data: {
            dadosDaRequisicao: data.data.dadosDaRequisicao,
            totalizacaoPorElementosDeDespesasDetalhados:
              data.data.totalizacaoPorElementosDeDespesasDetalhados,
            detalhesDaAquisicaoDosItens: data.data.detalhesDaAquisicaoDosItens
          }
        };

      const requisicaoMaterialDtoFormat: UpdateSipacRequisicaoMaterialDto =
        SipacRequisicaoMaterialMapper.toUpdateDto(result.data);

      this.logger.log(
        `Retornando requisição de material do SIPAC com ID: ${id}`
      );

      return requisicaoMaterialDtoFormat;
    } catch (error) {
      this.logger.error(
        `Erro durante a busca e persistência da requisição de material do SIPAC com ID: ${id}.`,
        error.stack
      );
      throw error;
    }
  }

  //só retorna o JSON da requisição de material do SIPAC (busca por numero/ano), não persiste no banco
  async fetchByNumeroAnoAndReturnRequisicaoMaterialComplete(numeroAno: string) {
    const infoFromList =
      await this.listaRequisicoesMateriaisService.fetchByNumeroAnoAndReturnListaRequisicaoMaterial(
        numeroAno
      );
    const infoFromDetail = await this.fetchAndReturnRequisicaoMaterial(
      infoFromList.id
    );

    const infoComplete = {
      ...infoFromList,
      ...infoFromDetail
    };

    return infoComplete;
  }

  // persiste os dados de uma requisição de material no banco
  async fetchCompleteAndPersistCreateOrUpdateRequisicaoMaterial(
    numeroAno: string
  ) {
    {
      const exists = await this.prisma.sipacRequisicaoMaterial.findFirst({
        where: {
          numeroDaRequisicao: numeroAno
        }
      });

      if (exists) {
        this.logger.log(`A requisição de material já existe. Atualizando...`);
        const newData =
          await this.fetchByNumeroAnoAndReturnRequisicaoMaterialComplete(
            numeroAno
          );
        return await this.persistUpdateRequisicaoMaterial(exists.id, newData);
      } else {
        this.logger.log(`A requisição de material não existe. Criando...`);
        const createData =
          await this.fetchByNumeroAnoAndReturnRequisicaoMaterialComplete(
            numeroAno
          );
        return await this.persistCreateRequisicaoMateiral(createData);
      }
    }
  }

  // mostra as requisições do sipac que já foram cadastradas no SISMAN
  async list() {
    return await this.prisma.sipacRequisicaoMaterial.findMany({
      include: {
        itensDaRequisicao: {
          include: {
            material: true
          }
        }
      }
    });
  }

  // persiste os dados de múltiplas requisições de material no banco
  async fetchCompleteAndPersistCreateOrUpdateRequisicaoMaterialArray(
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
        await this.fetchCompleteAndPersistCreateOrUpdateRequisicaoMaterial(
          numeroAno
        );
        results.push({ numeroAno, status: 'success' });
        successfulCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';
        this.logger.error(
          `Falha ao processar requisição de material com numeroAno: ${numeroAno}. Erro: ${errorMessage}`
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
}
export interface ProcessNumeroAnoResult {
  numeroAno: string;
  status: 'success' | 'failed';
  message?: string;
}

export interface ProcessCodigoResult {
  codigo: string;
  status: 'success' | 'failed';
  message?: string;
}
