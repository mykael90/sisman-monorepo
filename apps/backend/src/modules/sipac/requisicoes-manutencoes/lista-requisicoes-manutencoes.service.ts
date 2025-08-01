import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@sisman/prisma';
import { SipacScrapingService } from '../sipac-scraping.service';
import {
  SipacListaRequisicaoManutencaoResponseItem,
  SipacPaginatedScrapingResponse,
  SyncResult
} from '../sipac-scraping.interfaces';
import {
  CreateManySipacListaRequisicaoManutencaoDto,
  CreateSipacListaRequisicaoManutencaoDto
} from '@sisman/types';
import { SipacListaRequisicaoManutencaoMapper } from './mappers/sipac-lista-requisicao-manutencao.mapper';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ListaRequisicoesManutencoesService {
  private readonly logger = new Logger(ListaRequisicoesManutencoesService.name);
  private readonly URL_PATH = 'sipac/lista/requisicao/manutencao';

  // Constant query parameters - TODO: Confirm these for maintenance requisitions
  private readonly CONSTANT_PARAMS = {
    'tipoReq.id': 11, // Assuming a different type ID for maintenance
    buscaTipo: true
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly sipacScraping: SipacScrapingService
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
  //   const result = await this.fetchAllAndPersistListaRequisicoesManutencoes('01/01/2025', '05/01/2025'); // Placeholder dates
  //   this.logger.log(
  //     `Sincronização agendada de requisições de manutenções do SIPAC concluída. Summary: ${JSON.stringify(result.summary)}, Details: ${result.details.length} items processed.`
  //   );
  // }
  // @Cron(
  //   process.env.CRON_SIPAC_REQUISICOES_MANUTENCOES_SYNC || '0 0 * * *' // Daily at midnight
  // )
  // async handleCronSyncRequisicoesManutencoes() {
  //   this.logger.log(
  //     'Iniciando sincronização agendada de requisições de manutenções do SIPAC...'
  //   );
  //   // You'll need to define how to get dataInicial and dataFinal for cron jobs
  //   // For example, sync for the previous day or week.
  //   const result = await this.fetchAllAndPersistListaRequisicoesManutencoes('01/01/2025', '05/01/2025'); // Placeholder dates
  //   this.logger.log(
  //     `Sincronização agendada de requisições de manutenções do SIPAC concluída. Total processado: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
  //   );
  // }

  private async persistManyListaRequisicoesManutencoes(
    data: CreateManySipacListaRequisicaoManutencaoDto
  ): Promise<void> {
    try {
      // Assuming 'id' is unique and can be used for upsert or createMany with skipDuplicates
      // For simplicity, using createMany with skipDuplicates as in MateriaisService
      const result = await this.prisma.sipacRequisicaoManutencao.createMany({
        data: data.items,
        skipDuplicates: true
      });
      this.logger.log(
        `Requisições de manutenções persistidas/atualizadas com sucesso.`
      );

      const response = {
        created: result.count,
        skipped: data.items.length - result.count
      };

      this.logger.log(
        `${response.created} requisições de manutenções criadas e ${response.skipped} já existentes`
      );

      return;
    } catch (error) {
      this.logger.error(
        `Erro ao persistir lote de requisições de manutenções: ${error.message}`,
        error.stack
      );
      throw error; // Re-throw for the caller to handle batch failure
    }
  }

  async fetchAllAndPersistListaRequisicoesManutencoes(
    dataInicial: string,
    dataFinal: string
  ): Promise<DetailedSyncWithListaItemsResult> {
    this.logger.log(
      'Buscando todas as requisições de manutenções do SIPAC. do período ' +
        dataInicial +
        ' até ' +
        dataFinal +
        '...'
    );
    const details: ProcessedListaItemResult[] = [];
    let successfulItems = 0;
    let failedItems = 0;
    let itemsFetched = 0;
    try {
      const response = await this.sipacScraping.get<
        SipacPaginatedScrapingResponse<SipacListaRequisicaoManutencaoResponseItem>
      >(
        this.URL_PATH,
        {
          ...this.CONSTANT_PARAMS,
          buscaData: true,
          dataInicial,
          dataFinal
        },
        undefined, // headers
        { timeout: 10 * 60 * 1000 } // chamada demorada, permitir até 10 minutos inicialmente, depois revisa
      );

      const requisicoes = response.data.data.items;
      itemsFetched = requisicoes ? requisicoes.length : 0;

      if (requisicoes && requisicoes.length > 0) {
        const dtosToPersist = requisicoes.map((item) =>
          SipacListaRequisicaoManutencaoMapper.toCreateDto(item)
        );
        this.logger.log(
          `Recebidas ${itemsFetched} requisições. Persistindo...`
        );
        const createManyDto: CreateManySipacListaRequisicaoManutencaoDto = {
          items: dtosToPersist
        };
        try {
          await this.persistManyListaRequisicoesManutencoes(createManyDto);
          successfulItems = itemsFetched;
          dtosToPersist.forEach((dto) => {
            details.push({
              identifier: dto.numeroRequisicao,
              status: 'success'
            });
          });
        } catch (persistError) {
          this.logger.error(
            `Erro CRÍTICO ao persistir LOTE de requisições: ${persistError.message}`,
            persistError.stack
          );
          failedItems = itemsFetched;
          const errorMessage =
            persistError instanceof Error
              ? persistError.message
              : 'Erro desconhecido na persistência';
          dtosToPersist.forEach((dto) => {
            details.push({
              identifier: dto.numeroRequisicao,
              status: 'failed',
              message: errorMessage
            });
          });
        }
      } else {
        this.logger.log(`Nenhuma requisição encontrada. Finalizando busca.`);
      }
    } catch (error) {
      this.logger.error(
        `Erro geral ao buscar ou persistir requisições de manutenções: ${error.message}`,
        error.stack
      );
      // If fetch fails, itemsFetched is 0. All summary counts remain 0. Details is empty.
      // Or, add a single detail for the overall fetch failure if desired:
      // details.push({ identifier: `batch_fetch_${dataInicial}_${dataFinal}`, status: 'failed', message: fetchError.message });
    }

    const finalTotalProcessed = itemsFetched;

    this.logger.log(
      `Sincronização de requisições de manutenções do SIPAC concluída. Total processado: ${finalTotalProcessed}, Sucesso: ${successfulItems}, Falhas: ${failedItems}.`
    );
    return {
      summary: {
        totalProcessed: finalTotalProcessed,
        successful: successfulItems,
        failed: failedItems
      },
      details
    };
  }

  async fetchManyByNumeroAnoAndPersistListaRequisicoesManutencoes(
    numeroAnoArray: string[]
  ): Promise<DetailedSyncWithListaItemsResult> {
    this.logger.log(
      `Iniciando busca e persistência de múltiplas requisições de manutenções por ID do SIPAC. Total de IDs: ${numeroAnoArray.length}`
    );
    const allDetails: ProcessedListaItemResult[] = [];
    let totalSuccessful = 0;
    let totalFailed = 0;

    for (const numeroAno of numeroAnoArray) {
      const result =
        await this.fetchByNumeroAnoAndPersistListaRequisicaoManutencao(
          numeroAno
        );
      // result.details will contain one item
      allDetails.push(...result.details);
      totalSuccessful += result.summary.successful;
      totalFailed += result.summary.failed;
    }

    const totalProcessed = numeroAnoArray.length;
    this.logger.log(
      `Concluída a busca e persistência de múltiplas requisições de manutenções por ID do SIPAC. Total processado: ${totalProcessed}, Sucesso: ${totalSuccessful}, Falhas: ${totalFailed}.`
    );
    return {
      summary: {
        totalProcessed,
        successful: totalSuccessful,
        failed: totalFailed
      },
      details: allDetails
    };
  }

  async fetchByNumeroAnoAndPersistListaRequisicaoManutencao(
    numeroAno: string
  ): Promise<DetailedSyncWithListaItemsResult> {
    const numero = numeroAno.split('/')[0];
    const ano = numeroAno.split('/')[1];
    this.logger.log(
      `Buscando e persistindo requisição de manutenção do SIPAC com numero: ${numero}/${ano}...`
    );

    const details: ProcessedListaItemResult[] = [];
    let status: 'success' | 'failed' = 'failed'; // Default to failed
    let message: string | undefined;
    let successfulCount = 0;
    let failedCount = 0;

    try {
      const response = await this.sipacScraping.get<
        SipacPaginatedScrapingResponse<SipacListaRequisicaoManutencaoResponseItem>
      >(
        this.URL_PATH,
        {
          ...this.CONSTANT_PARAMS,
          buscaNumAno: true,
          numero,
          ano
        },
        undefined, // headers
        undefined // options
      );

      const requisicao = response.data.data.items[0]; // Expecting a single item in the array
      if (requisicao) {
        const createDto =
          SipacListaRequisicaoManutencaoMapper.toCreateDto(requisicao);
        this.logger.log(
          `Requisição de manutenção com numero ${numero}/${ano} encontrada. Persistindo...`
        );
        const createManyDto: CreateManySipacListaRequisicaoManutencaoDto = {
          items: [createDto]
        };
        try {
          await this.persistManyListaRequisicoesManutencoes(createManyDto);
          status = 'success';
          successfulCount = 1;
          this.logger.log(
            `Requisição de manutenção com numero ${numero}/${ano} persistida com sucesso (ou skipDuplicates).`
          );
        } catch (persistError) {
          this.logger.error(
            `Erro CRÍTICO ao persistir requisição de manutenção com numero ${numero}/${ano}: ${persistError.message}`,
            persistError.stack
          );
          message =
            persistError instanceof Error
              ? persistError.message
              : 'Erro desconhecido na persistência';
          failedCount = 1;
        }
      } else {
        message = `Nenhuma requisição encontrada com numero ${numero}/${ano}.`;
        this.logger.warn(message);
        failedCount = 1;
      }
    } catch (fetchError) {
      this.logger.error(
        `Erro ao buscar ou processar requisição de manutenção com numero ${numero}/${ano}: ${fetchError.message}`,
        fetchError.stack
      );
      message =
        fetchError instanceof Error
          ? fetchError.message
          : 'Erro desconhecido na busca';
      failedCount = 1;
    }

    details.push({ identifier: numeroAno, status, message });

    return {
      summary: {
        totalProcessed: 1, // Always 1 for this method
        successful: successfulCount,
        failed: failedCount
      },
      details
    };
  }

  async fetchByNumeroAnoAndReturnListaRequisicaoManutencao(numeroAno: string) {
    const numero = numeroAno.split('/')[0];
    const ano = numeroAno.split('/')[1];
    this.logger.log(
      `Buscando e retornando requisição de manutenção do SIPAC com numero: ${numero}/${ano}...`
    );

    try {
      const request = await this.sipacScraping.get<
        SipacPaginatedScrapingResponse<SipacListaRequisicaoManutencaoResponseItem>
      >(
        this.URL_PATH,
        {
          ...this.CONSTANT_PARAMS,
          buscaNumAno: true,
          numero,
          ano
        },
        undefined, // headers
        undefined // options
      );

      const result = request.data.data.items[0]; // Expecting a single item in the array

      if (!result) {
        // Consistent with how fetchByNumeroAnoAndPersistListaRequisicaoManutencao handles not found
        throw new Error(
          `Nenhuma requisição encontrada com numero ${numero}/${ano}.`
        );
      }

      const listaRequisicaoManutencaoDtoFormat: CreateManySipacListaRequisicaoManutencaoDto =
        {
          items: [SipacListaRequisicaoManutencaoMapper.toCreateDto(result)]
        };

      return listaRequisicaoManutencaoDtoFormat.items[0];
    } catch (error) {
      this.logger.error(
        `Erro ao buscar ou processar requisição de manutenção com numero ${numero}/${ano}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Busca uma pequena quantidade de requisições de manutenções da API do SIPAC para teste de conexão.
   * Não persiste os dados.
   * @returns A resposta paginada da API do SIPAC contendo as requisições de manutenções.
   */
  async testFetchListaRequisicoesManutencoes(
    dataInicial: string,
    dataFinal: string
  ) {
    this.logger.log(
      'Iniciando teste de busca de requisições de manutenções do SIPAC...'
    );
    try {
      const result = await this.sipacScraping.get<
        SipacPaginatedScrapingResponse<SipacListaRequisicaoManutencaoResponseItem>
      >(this.URL_PATH, {
        ...this.CONSTANT_PARAMS,
        buscaData: true,
        dataInicial,
        dataFinal
      });
      this.logger.log(
        'Teste de busca de requisições de manutenções do SIPAC concluído com sucesso.'
      );
      const { data } = result;

      const response: SipacPaginatedScrapingResponse<SipacListaRequisicaoManutencaoResponseItem> =
        {
          metadata: data.metadata,
          data: {
            items: data.data.items,
            pagination: data.data.pagination
          }
        };

      const createManyDto: CreateManySipacListaRequisicaoManutencaoDto = {
        items: response.data.items.map((item) => {
          return SipacListaRequisicaoManutencaoMapper.toCreateDto(item);
        })
      };

      await this.persistManyListaRequisicoesManutencoes(createManyDto);

      return response;
    } catch (error) {
      this.logger.error(
        'Erro durante o teste de busca de requisições de manutenções do SIPAC.',
        error.stack
      );
      throw error;
    }
  }
}

export interface ProcessedListaItemResult {
  identifier: string; // numeroAno (e.g., "123/2024")
  status: 'success' | 'failed';
  message?: string;
}

export interface DetailedSyncWithListaItemsResult {
  summary: SyncResult; // SyncResult is { totalProcessed: number; successful: number; failed: number }
  details: ProcessedListaItemResult[];
}
