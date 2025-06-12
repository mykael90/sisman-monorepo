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
import { AxiosRequestConfig } from 'axios';
import { handlePrismaError } from '../../../shared/utils/prisma-error-handler';
import { ListaRequisicoesMateriaisService } from './lista-requisicoes-materiais.service';
import { MateriaisService } from '../materiais/materiais.service';

@Injectable()
export class RequisicoesMateriaisService {
  private readonly logger = new Logger(RequisicoesMateriaisService.name);
  private readonly URL_PATH = 'sipac/requisicao/material';

  // Constant query parameters
  private readonly CONSTANT_PARAMS = {
    acao: 200
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly listaRequisicoesMateriaisService: ListaRequisicoesMateriaisService,
    private readonly materiaisService: MateriaisService,
    private readonly sipacScraping: SipacScrapingService
  ) {}

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

  private async persistUpdateRequisicaoMaterial(
    id: number,
    data: UpdateSipacRequisicaoMaterialDto
  ) {
    const sipacRequisicaoMaterialModel = Prisma.dmmf.datamodel.models.find(
      (model) => model.name === 'SipacRequisicaoMaterial'
    );

    let relationalKeysFromDMMF: string[] = [];
    const prismaUpdateInput: Prisma.SipacRequisicaoMaterialUpdateInput = {};
    const relationsToInclude: Prisma.SipacRequisicaoMaterialInclude = {};
    let hasUpdates = false;

    if (sipacRequisicaoMaterialModel) {
      // Antes de processar as atualizações, garantir que os materiais dos itens existem
      if (data.itensDaRequisicao && data.itensDaRequisicao.length > 0) {
        const itensParaVerificar = data.itensDaRequisicao.map((item) => ({
          codigo: item.codigo // Supondo que o DTO de update tenha `codigo` nos itens
        }));
        await this.ensureMateriaisExistentes(itensParaVerificar as any); // `as any` para simplificar, idealmente tipar corretamente
      }
      relationalKeysFromDMMF = sipacRequisicaoMaterialModel.fields
        .filter((field) => field.kind === 'object' && field.relationName) // Filtra apenas campos que são objetos (outros modelos) e têm um nome de relação
        .map((field) => field.name);
    } else {
      this.logger.error(
        'Modelo SipacRequisicaoMaterial não encontrado no DMMF.'
      );
    }

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const typedKey = key as keyof Prisma.SipacRequisicaoMaterialUpdateInput;
        const value = data[typedKey];

        if (value === undefined) {
          // 'undefined' significa "não alterar este campo"
          continue;
        }
        hasUpdates = true;

        // 2. Verificar se a chave é uma relação para definir com 'create'
        if (
          relationalKeysFromDMMF.includes(typedKey) &&
          Array.isArray(value) // 'value' deve ser um array (pode ser vazio para remover todas as conexões)
        ) {
          // Usar 'create' para criar completamente as conexões existentes
          (prismaUpdateInput as any)[typedKey] = {
            deleteMany: {}, // Delete all existing items
            create: value // Create the new items
          };
          (relationsToInclude as any)[typedKey] = true;
        } else if (
          Object.values(Prisma.SipacRequisicaoMaterialScalarFieldEnum).includes(
            typedKey as Prisma.SipacRequisicaoMaterialScalarFieldEnum
          )
        ) {
          // É um campo escalar válido para o modelo User
          (prismaUpdateInput as any)[typedKey] = value;
        }
      }
    }

    if (!hasUpdates && Object.keys(prismaUpdateInput).length === 0) {
      // Verifica também se prismaUpdateInput está realmente vazio, caso todos os valores
      // fossem undefined, mas alguma chave de relação com array vazio tenha sido processada.
      this.logger.warn(
        `Nenhuma alteração fornecida para a requisição de material ID: ${id}. Retornando dados existentes.`
      );
      const existingRequisicaoMaterial =
        await this.prisma.sipacRequisicaoMaterial.findUnique({
          where: { id },
          // Inclui as relações que poderiam ter sido atualizadas, mesmo que não tenham sido
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

    try {
      this.logger.log(`Persistindo a atualização de requisição de material...`);
      return await this.prisma.sipacRequisicaoMaterial.update({
        where: { id },
        data: prismaUpdateInput,
        //para ter as relações no retorno
        include:
          Object.keys(relationsToInclude).length > 0
            ? relationsToInclude
            : undefined
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Requisição de Material SIPAC', {
        operation: 'update',
        id: id,
        data
      });
      throw error;
    }
  }

  private async persistCreateRequisicaoMateiral(
    data: CreateSipacRequisicaoMaterialCompletoDto
  ) {
    const sipacRequisicaoMaterialModel = Prisma.dmmf.datamodel.models.find(
      (model) => model.name === 'SipacRequisicaoMaterial'
    );

    let relationalKeysFromDMMF: string[] = [];
    const relationsToInclude: Prisma.SipacRequisicaoMaterialInclude = {};

    if (sipacRequisicaoMaterialModel) {
      relationalKeysFromDMMF = sipacRequisicaoMaterialModel.fields
        .filter((field) => field.kind === 'object' && field.relationName)
        .map((field) => field.name);
    } else {
      this.logger.error(
        'Modelo SipacRequisicaoMaterial não encontrado no DMMF.'
      );
    }

    const prismaCreateInput = {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const typedKey = key as keyof CreateSipacRequisicaoMaterialCompletoDto;
        const value = data[typedKey];

        if (relationalKeysFromDMMF.includes(typedKey)) {
          // If it's a relational field, wrap in 'create'
          if (Array.isArray(value)) {
            (prismaCreateInput as any)[typedKey] = {
              create: value
            };
            (relationsToInclude as any)[typedKey] = true;
          } else if (value !== null && typeof value === 'object') {
            // Handle single nested object relations if any
            (prismaCreateInput as any)[typedKey] = {
              create: value
            };
            (relationsToInclude as any)[typedKey] = true;
          }
        } else {
          // Assume it's a scalar field and assign directly
          (prismaCreateInput as any)[typedKey] = value;
        }
      }
    }

    // Garante que os materiais referenciados nos itens da requisição existam
    if (data.itensDaRequisicao && data.itensDaRequisicao.length > 0) {
      const ensureMateriaisResult = await this.ensureMateriaisExistentes(
        data.itensDaRequisicao
      );
      this.logger.log(ensureMateriaisResult);
      if (ensureMateriaisResult && ensureMateriaisResult.summary.failed > 0) {
        const failedCodigos = ensureMateriaisResult.details
          .filter((detail) => detail.status === 'failed')
          .map((detail) => detail.codigo);

        if (failedCodigos.length > 0) {
          this.logger.warn(
            `Removendo itens da requisição devido à falha na criação/localização dos seguintes materiais (códigos): ${failedCodigos.join(', ')}`
          );
          // Atualiza o prismaCreateInput para remover os itens com materiais falhados
          if ((prismaCreateInput as any).itensDaRequisicao?.create) {
            (prismaCreateInput as any).itensDaRequisicao.create = (
              prismaCreateInput as any
            ).itensDaRequisicao.create.filter(
              (item: any) => !failedCodigos.includes(item.codigo)
            );
          }
        }
      }
    }
    try {
      this.logger.log(`Persistindo a criação da requisição de material...`);
      return await this.prisma.sipacRequisicaoMaterial.create({
        data: { ...(prismaCreateInput as any) },
        include:
          Object.keys(relationsToInclude).length > 0
            ? relationsToInclude
            : undefined
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Requisição de Material SIPAC', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  private async ensureMateriaisExistentes(
    itensRequisicao: Array<{ codigo: string; [key: string]: any }>
  ): Promise<
    | {
        summary: { totalProcessed: number; successful: number; failed: number };
        details: ProcessCodigoResult[];
      }
    | undefined
  > {
    if (!itensRequisicao || itensRequisicao.length === 0) {
      return undefined;
    }

    this.logger.log(`Ensuring materials exist for provided codes.`);

    const uniqueCodigos = [
      ...new Set(itensRequisicao.map((item) => item.codigo))
    ];
    const details: ProcessCodigoResult[] = [];
    let successfulCount = 0;
    let failedCount = 0;

    const registeredItems = await this.prisma.sipacMaterial.findMany({
      where: { codigo: { in: uniqueCodigos } },
      select: { codigo: true }
    });

    const codigosEncontrados = registeredItems.map(
      (register) => register.codigo
    );

    for (const codigo of uniqueCodigos) {
      if (codigosEncontrados.includes(codigo)) {
        details.push({ codigo, status: 'success', message: 'Already existed' });
        successfulCount++;
      }
    }

    const codigosNaoEncontrados = uniqueCodigos.filter(
      (codigo) => !codigosEncontrados.includes(codigo)
    );

    if (codigosNaoEncontrados.length > 0) {
      this.logger.warn(
        `Codes not found locally: ${codigosNaoEncontrados.join(', ')}. Attempting to fetch and persist...`
      );

      for (const codigo of codigosNaoEncontrados) {
        try {
          const singleCreationResult =
            await this.materiaisService.fetchByCodeAndPersistMaterial(codigo);
          if (singleCreationResult.successful === 1) {
            details.push({ codigo, status: 'success', message: 'Created' });
            successfulCount++;
          } else {
            details.push({
              codigo,
              status: 'failed',
              message: 'Failed to create or find via service'
            });
            failedCount++;
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Unknown error during material fetch/persist';
          this.logger.error(
            `Error processing material code ${codigo} in ensureMateriaisExistentes: ${errorMessage}`
          );
          details.push({ codigo, status: 'failed', message: errorMessage });
          failedCount++;
        }
      }
    }

    return {
      summary: {
        totalProcessed: uniqueCodigos.length,
        successful: successfulCount,
        failed: failedCount
      },
      details
    };
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

      // Ensure materials exist before attempting to update relations
      if (
        updateDtoFormat.itensDaRequisicao &&
        updateDtoFormat.itensDaRequisicao.length > 0
      ) {
        await this.ensureMateriaisExistentes(
          updateDtoFormat.itensDaRequisicao as any[]
        );
      }

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
        const newData = await this.fetchAndReturnRequisicaoMaterial(exists.id);
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
