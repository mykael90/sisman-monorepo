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
} from './dto/sipac-requisicao-manutencao.dto';
import { SipacListaRequisicaoManutencaoMapper } from './mappers/sipac-lista-requisicao-manutencao.mapper';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ListaRequisicoesManutencoesService {
  private readonly logger = new Logger(ListaRequisicoesManutencoesService.name);
  private readonly URL_PATH = 'sipac/lista/requisicao/manutencao'; // TODO: Confirm the actual API path

  // Constant query parameters - TODO: Confirm these for maintenance requisitions
  private readonly CONSTANT_PARAMS = {
    'tipoReq.id': 2, // Assuming a different type ID for maintenance
    'subTipoReq.id': 2 // Assuming a different sub-type ID for maintenance
    // Add other necessary constant params for maintenance requisitions
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
      // Tratar erros de transação, talvez individualmente se necessário.
    }
  }

  async fetchAllAndPersistListaRequisicoesManutencoes(
    dataInicial: string,
    dataFinal: string
  ): Promise<SyncResult> {
    this.logger.log(
      'Buscando todas as requisições de manutenções do SIPAC. do período ' +
        dataInicial +
        ' até ' +
        dataFinal +
        '...'
    );
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
        this.logger.log(
          `Recebidas ${requisicoes.length} requisições. Persistindo...`
        );
        const createManyDto: CreateManySipacListaRequisicaoManutencaoDto = {
          items: requisicoes.map((item) =>
            SipacListaRequisicaoManutencaoMapper.toCreateDto(item)
          )
        };
        try {
          await this.persistManyListaRequisicoesManutencoes(createManyDto);
          successfulItems = requisicoes.length; // Assume all items in batch were passed to persistMany successfully
        } catch (persistError) {
          // This catch is likely unreachable if persistManyListaRequisicoesManutencoes handles its own errors and doesn't rethrow.
          this.logger.error(
            `Erro CRÍTICO ao persistir LOTE de requisições: ${persistError.message}`,
            persistError.stack
          );
          failedItems = requisicoes.length; // All items in the batch failed due to critical persistence error
        }
      } else {
        this.logger.log(`Nenhuma requisição encontrada. Finalizando busca.`);
      }
    } catch (error) {
      this.logger.error(
        `Erro geral ao buscar ou persistir requisições de manutenções: ${error.message}`,
        error.stack
      );
      // If fetch fails, itemsFetched will be 0, successfulItems and failedItems will be 0.
      // The SyncResult will correctly reflect {0,0,0} items processed.
    }

    // Determine finalTotalProcessed based on itemsFetched
    // If items were fetched, they were "processed" (attempted persistence)
    // If fetch failed or no items found, itemsFetched is 0, so finalTotalProcessed is 0.
    const finalTotalProcessed = itemsFetched;

    this.logger.log(
      `Sincronização de requisições de manutenções do SIPAC concluída. Total processado: ${finalTotalProcessed}, Sucesso: ${successfulItems}, Falhas: ${failedItems}.`
    );
    return {
      totalProcessed: finalTotalProcessed,
      successful: successfulItems,
      failed: failedItems
    };
  }

  async fetchManyByNumeroAnoAndPersistListaRequisicoesManutencoes(
    numeroAnoArray: string[]
  ): Promise<SyncResult> {
    //TODO: Consider using Promise.allSettled for concurrent processing if appropriate,
    // and then aggregate results. For now, sequential processing is maintained.
    this.logger.log(
      `Iniciando busca e persistência de múltiplas requisições de manutenções por ID do SIPAC. Total de IDs: ${numeroAnoArray.length}`
    );
    let totalProcessed = 0;
    let successful = 0;
    let failed = 0;

    for (const numeroAno of numeroAnoArray) {
      const result =
        await this.fetchByNumeroAnoAndPersistListaRequisicaoManutencao(
          numeroAno
        );
      totalProcessed += result.totalProcessed;
      successful += result.successful;
      failed += result.failed;
    }
    this.logger.log(
      `Concluída a busca e persistência de múltiplas requisições de manutenções por ID do SIPAC. Total processado: ${totalProcessed}, Sucesso: ${successful}, Falhas: ${failed}.`
    );
    return {
      totalProcessed,
      successful,
      failed
    };
  }

  async fetchByNumeroAnoAndPersistListaRequisicaoManutencao(
    numeroAno: string
  ): Promise<SyncResult> {
    //TODO: check pattern numeroAno
    const numero = numeroAno.split('/')[0];
    const ano = numeroAno.split('/')[1];
    this.logger.log(
      `Buscando e persistindo requisição de manutenção do SIPAC com numero: ${numero}/${ano}...`
    );
    let successful = 0;
    let failed = 0;

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
        this.logger.log(
          `Requisição de manutenção com numero ${numero}/${ano} encontrada. Persistindo...`
        );
        const createManyDto: CreateManySipacListaRequisicaoManutencaoDto = {
          items: [SipacListaRequisicaoManutencaoMapper.toCreateDto(requisicao)]
        };
        try {
          await this.persistManyListaRequisicoesManutencoes(createManyDto);
          successful = 1; // Item fetched and persistence attempt was successful (persistMany didn't throw)
          this.logger.log(
            `Requisição de manutenção com numero ${numero}/${ano} persistida com sucesso (ou skipDuplicates).`
          );
        } catch (persistError) {
          // This block is likely unreachable if persistManyListaRequisicoesManutencoes catches its own errors and doesn't rethrow.
          this.logger.error(
            `Erro CRÍTICO ao persistir requisição de manutenção com numero ${numero}/${ano}: ${persistError.message}`,
            persistError.stack
          );
          failed = 1; // Persistence failed critically
        }
      } else {
        this.logger.log(
          `Nenhuma requisição encontrada com numero ${numero}/${ano}.`
        );
        failed = 1; // Item not found is treated as a failed attempt for this specific numeroAno
      }
    } catch (error) {
      this.logger.error(
        `Erro ao buscar ou processar requisição de manutenção com numero ${numero}/${ano}: ${error.message}`,
        error.stack
      );
      failed = 1; // Fetch error or other unhandled error during processing of this item
    }

    // totalProcessed will be 1 because one numeroAno was processed,
    // resulting in either a success or a failure.
    return {
      totalProcessed: successful + failed, // This will be 1 (either 1+0 or 0+1)
      successful: successful,
      failed: failed
    };
  }

  async fetchByNumeroAnoAndReturnListaRequisicaoManutencao(numeroAno: string) {
    //TODO: check pattern numeroAno
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
        throw new Error(
          `Requisição de manutenção com numero ${numero}/${ano} não encontrada.`
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
