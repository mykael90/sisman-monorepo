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
import { SipacApiService } from '../sipac-api.service';
import {
  SipacUnidadeResponseItem,
  SipacPaginatedResponse,
  SyncResult
} from '../sipac-api.interfaces';
import {
  CreateManySipacUnidadeDto,
  CreateSipacUnidadeDto
} from '@sisman/types';
import { SipacUnidadeMapper } from './mappers/sipac-unidade.mapper';
import { normalizeString } from '../../../shared/utils/string-utils';

@Injectable()
export class UnidadesService {
  private readonly logger = new Logger(UnidadesService.name);
  private readonly ITEMS_PER_PAGE = 100; // Limite da API externa
  private readonly URL_PATH = 'internacionalizacao/v1/unidades';

  constructor(
    private readonly prisma: PrismaService,
    private readonly sipacHttp: SipacApiService
  ) {}

  // @Cron(
  //   process.env.CRON_SIPAC_UNIDADES_SYNC || '0 0 * * *' // Daily at midnight
  // )
  // async handleCronSyncUnidades() {
  //   this.logger.log(
  //     'Iniciando sincronização agendada de unidades do SIPAC...'
  //   );
  //   const result = await this.fetchAllAndPersistUnidades();
  //   this.logger.log(
  //     `Sincronização agendada de unidades do SIPAC concluída. Total processado: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
  //   );
  // }

  private async persistManyUnidades(
    data: CreateManySipacUnidadeDto
  ): Promise<void> {
    try {
      const result = await this.prisma.sipacUnidade.createMany({
        data: data.items,
        skipDuplicates: true
      });
      this.logger.log(`Unidades persistidas/atualizadas com sucesso.`);

      const response = {
        created: result.count,
        skipped: data.items.length - result.count
      };

      this.logger.log(
        `${response.created} unidades criadas e ${response.skipped} já existentes`
      );

      return;
    } catch (error) {
      this.logger.error(
        `Erro ao persistir lote de unidades: ${error.message}`,
        error.stack
      );
      // Tratar erros de transação, talvez individualmente se necessário.
    }
  }

  async fetchAllAndPersistUnidades(): Promise<SyncResult> {
    this.logger.log('Buscando todas as unidades do SIPAC...');
    let currentPage = 1;
    let offset = 0;
    let totalPages = 1;
    let successfulPersists = 0;
    let failedPersists = 0;

    try {
      // First request to get total pages
      this.logger.log(`Buscando unidades - Página: ${currentPage}`);
      const initialResponse = await this.sipacHttp.get<
        SipacUnidadeResponseItem[]
      >(
        this.URL_PATH,
        {
          offset,
          limit: this.ITEMS_PER_PAGE
        },
        {
          paginado: 'true'
        }
      );

      const initialHeaders = initialResponse.headers;
      totalPages = parseInt(initialHeaders['x-pages'], 10) || 1;
      this.logger.log(`Total de páginas a processar: ${totalPages}`);

      const unidadesDaPagina = initialResponse.data;
      if (unidadesDaPagina && unidadesDaPagina.length > 0) {
        this.logger.log(
          `Recebidas ${unidadesDaPagina.length} unidades na página ${currentPage}. Persistindo...`
        );
        const createManyDto: CreateManySipacUnidadeDto = {
          items: unidadesDaPagina.map((item) =>
            SipacUnidadeMapper.toCreateDto(item)
          )
        };
        try {
          await this.persistManyUnidades(createManyDto);
          successfulPersists += unidadesDaPagina.length;
        } catch (persistError) {
          this.logger.error(
            `Erro ao persistir unidades da página ${currentPage}: ${persistError.message}`,
            persistError.stack
          );
          failedPersists += unidadesDaPagina.length;
        }
      } else {
        this.logger.log(
          `Nenhuma unidade encontrada na página ${currentPage}. Finalizando busca.`
        );
      }

      currentPage++;
      offset = (currentPage - 1) * this.ITEMS_PER_PAGE;

      // Loop for subsequent pages
      while (currentPage <= totalPages) {
        this.logger.log(`Buscando unidades - Página: ${currentPage}`);
        const response = await this.sipacHttp.get<SipacUnidadeResponseItem[]>(
          this.URL_PATH,
          {
            offset,
            limit: this.ITEMS_PER_PAGE
          },
          {
            paginado: 'true'
          }
        );

        const unidadesSubsequentes = response.data;
        if (unidadesSubsequentes && unidadesSubsequentes.length > 0) {
          this.logger.log(
            `Recebidas ${unidadesSubsequentes.length} unidades na página ${currentPage}. Persistindo...`
          );
          const createManyDto: CreateManySipacUnidadeDto = {
            items: unidadesSubsequentes.map((item) =>
              SipacUnidadeMapper.toCreateDto(item)
            )
          };
          try {
            await this.persistManyUnidades(createManyDto);
            successfulPersists += unidadesSubsequentes.length;
          } catch (persistError) {
            this.logger.error(
              `Erro ao persistir unidades da página ${currentPage}: ${persistError.message}`,
              persistError.stack
            );
            failedPersists += unidadesSubsequentes.length;
          }
        } else {
          this.logger.log(
            `Nenhuma unidade encontrada na página ${currentPage}. Finalizando busca.`
          );
        }
        currentPage++;
        offset = (currentPage - 1) * this.ITEMS_PER_PAGE;
      }
    } catch (error) {
      this.logger.error(
        `Erro geral ao buscar ou persistir unidades: ${error.message}`,
        error.stack
      );
      // If a general error occurs, we can't determine successful/failed counts accurately for the whole process
      // So we'll just return what we have so far, or 0 if it failed before any processing.
      return {
        totalProcessed: successfulPersists + failedPersists,
        successful: successfulPersists,
        failed: failedPersists
      };
    }
    this.logger.log(
      `Sincronização de unidades do SIPAC concluída. Total processado: ${successfulPersists + failedPersists}, Sucesso: ${successfulPersists}, Falhas: ${failedPersists}.`
    );
    return {
      totalProcessed: successfulPersists + failedPersists,
      successful: successfulPersists,
      failed: failedPersists
    };
  }

  async fetchManyByCodesAndPersistUnidades(
    codigosUnidade: string[]
  ): Promise<SyncResult> {
    this.logger.log(
      `Iniciando busca e persistência de múltiplas unidades por código do SIPAC. Total de códigos: ${codigosUnidade.length}`
    );
    let totalProcessed = 0;
    let successful = 0;
    let failed = 0;

    for (const code of codigosUnidade) {
      const result = await this.fetchByCodeAndPersistUnidade(code);
      totalProcessed += result.totalProcessed;
      successful += result.successful;
      failed += result.failed;
    }
    this.logger.log(
      `Concluída a busca e persistência de múltiplas unidades por código do SIPAC. Total processado: ${totalProcessed}, Sucesso: ${successful}, Falhas: ${failed}.`
    );
    return {
      totalProcessed,
      successful,
      failed
    };
  }

  async fetchByCodeAndPersistUnidade(
    codigoUnidade: string
  ): Promise<SyncResult> {
    this.logger.log(
      `Buscando e persistindo unidade do SIPAC com código: ${codigoUnidade}...`
    );
    let successfulPersists = 0;
    let failedPersists = 0;

    try {
      const response = await this.sipacHttp.get<SipacUnidadeResponseItem[]>(
        this.URL_PATH,
        {
          offset: 0, // Always 0 for a single code search
          limit: 1, // Only expect one item
          'codigo-unidade': codigoUnidade
        },
        {
          paginado: 'true'
        }
      );

      const unidade = response.data[0]; // Expecting a single item in the array
      if (unidade) {
        this.logger.log(
          `Unidade com código ${codigoUnidade} encontrada. Persistindo...`
        );
        const createManyDto: CreateManySipacUnidadeDto = {
          items: [SipacUnidadeMapper.toCreateDto(unidade)]
        };
        try {
          await this.persistManyUnidades(createManyDto);
          successfulPersists++;
          this.logger.log(
            `Unidade com código ${codigoUnidade} persistida com sucesso.`
          );
        } catch (persistError) {
          this.logger.error(
            `Erro ao persistir unidade com código ${codigoUnidade}: ${persistError.message}`,
            persistError.stack
          );
          failedPersists++;
        }
      } else {
        this.logger.log(
          `Nenhuma unidade encontrada para o código ${codigoUnidade}.`
        );
        failedPersists++; // Mark as failed if no unidade is found
      }
    } catch (error) {
      this.logger.error(
        `Erro ao buscar ou persistir unidade com código ${codigoUnidade}: ${error.message}`,
        error.stack
      );
      failedPersists++; // Mark as failed if the fetch itself fails
    }
    return {
      totalProcessed: successfulPersists + failedPersists,
      successful: successfulPersists,
      failed: failedPersists
    };
  }

  /**
   * Busca uma pequena quantidade de unidades da API do SIPAC para teste de conexão.
   * Não persiste os dados.
   * @returns A resposta paginada da API do SIPAC contendo as unidades.
   */
  async testFetchUnidades() {
    const offset = 0;
    const limit = 100;

    this.logger.log('Iniciando teste de busca de unidades do SIPAC...');
    try {
      const result = await this.sipacHttp.get<SipacUnidadeResponseItem[]>(
        this.URL_PATH,
        {
          offset,
          limit
        },
        {
          paginado: 'true'
        }
      );
      this.logger.log(
        'Teste de busca de unidades do SIPAC concluído com sucesso.'
      );
      const { headers, data } = result;

      const response: SipacPaginatedResponse<SipacUnidadeResponseItem> = {
        items: data,
        totalItems: headers['x-total'],
        offset: offset,
        limit: limit,
        totalPages: headers['x-pages']
      };

      const createDto: CreateSipacUnidadeDto = SipacUnidadeMapper.toCreateDto(
        response.items[0]
      );

      const createManyDto: CreateManySipacUnidadeDto = {
        items: response.items.map((item) => {
          return SipacUnidadeMapper.toCreateDto(item);
        })
      };

      // await this.persistManyUnidades(createManyDto);

      return createManyDto;
    } catch (error) {
      this.logger.error(
        'Erro durante o teste de busca de unidades do SIPAC.',
        error.stack
      );
      throw error; // Re-lança o erro para ser tratado por quem chamou
    }
  }

  async findOrCreateUnidadeByNome(
    nomeUnidade: string
  ): Promise<Prisma.SipacUnidadeGetPayload<{}>> {
    let unidade = await this.prisma.sipacUnidade.findFirst({
      where: { nomeUnidade: normalizeString(nomeUnidade) } // Assumes 'nomeUnidade'
    });

    if (unidade) {
      this.logger.log(
        `Unidade '${nomeUnidade}' encontrada no banco de dados local.`
      );
      return unidade;
    }

    this.logger.log(
      `Unidade '${nomeUnidade}' não encontrada localmente. Buscando na API SIPAC...`
    );

    // API parameter 'nome-unidade'
    const apiUnidadesResponse = await this.sipacHttp.get<
      SipacUnidadeResponseItem[]
    >(
      this.URL_PATH,
      {
        offset: 0,
        limit: 1,
        'nome-unidade': nomeUnidade
      },
      {
        paginado: 'true'
      }
    );

    const apiUnidadeData =
      apiUnidadesResponse.data && apiUnidadesResponse.data.length > 0
        ? apiUnidadesResponse.data[0]
        : null;

    if (!apiUnidadeData) {
      this.logger.error(
        `Unidade com nome '${nomeUnidade}' não encontrada na API SIPAC.`
      );
      throw new NotFoundException(
        `Unidade com nome '${nomeUnidade}' não encontrada na API SIPAC.`
      );
    }

    this.logger.log(
      `Unidade '${nomeUnidade}' encontrada na API SIPAC. Persistindo...`
    );
    // Assumes SipacUnidadeMapper.toCreateDto
    const unidadeDto = SipacUnidadeMapper.toCreateDto(apiUnidadeData);

    const novaUnidade = await this.prisma.sipacUnidade.create({
      data: unidadeDto
    });
    this.logger.log(
      `Unidade '${nomeUnidade}' (ID: ${novaUnidade.id}) persistida com sucesso.`
    );
    return novaUnidade;
  }

  async getOrCreateUnidadeByNome(
    nomeUnidadeOriginal: string | undefined | null,
    tipoUnidade: 'requisitante' | 'custo'
  ): Promise<{ id: number } | null> {
    if (!nomeUnidadeOriginal || nomeUnidadeOriginal.trim() === '') {
      this.logger.warn(`Nome da unidade ${tipoUnidade} está vazio ou ausente.`);
      return null;
    }
    try {
      const unidade = await this.findOrCreateUnidadeByNome(nomeUnidadeOriginal);
      return { id: unidade.id };
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.error(
          `Falha ao obter ou criar unidade ${tipoUnidade} '${nomeUnidadeOriginal}': ${error.message}`
        );
        throw new BadRequestException(
          `Unidade ${tipoUnidade} '${nomeUnidadeOriginal}' não encontrada e não pôde ser criada via SIPAC. Detalhe: ${error.message}`
        );
      }
      this.logger.error(
        `Erro inesperado ao processar unidade ${tipoUnidade} '${nomeUnidadeOriginal}': ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async findOrCreateUnidadeBySigla(
    sigla: string
  ): Promise<Prisma.SipacUnidadeGetPayload<{}>> {
    let unidade = await this.prisma.sipacUnidade.findFirst({
      where: { sigla: sigla } // Assumes 'siglaUnidade'
    });

    if (unidade) {
      this.logger.log(
        `Unidade '${sigla}'  encontrada no banco de dados local.`
      );
      return unidade;
    }

    this.logger.log(
      `Unidade '${sigla}' não encontrada localmente. Buscando na API SIPAC...`
    );

    // API parameter 'sigla' is assumed
    const apiUnidadesResponse = await this.sipacHttp.get<
      SipacUnidadeResponseItem[]
    >(
      this.URL_PATH,
      {
        offset: 0,
        limit: 1,
        sigla: sigla
      },
      {
        paginado: 'true'
      }
    );

    const apiUnidadeData =
      apiUnidadesResponse.data && apiUnidadesResponse.data.length > 0
        ? apiUnidadesResponse.data[0]
        : null;

    if (!apiUnidadeData) {
      this.logger.error(
        `Unidade com sigla '${sigla}' não encontrada na API SIPAC.`
      );
      throw new NotFoundException(
        `Unidade com sigla '${sigla}' não encontrada na API SIPAC.`
      );
    }

    this.logger.log(
      `Unidade '${sigla}' encontrada na API SIPAC. Persistindo...`
    );
    // Assumes SipacUnidadeMapper.toCreateDto
    const unidadeDto = SipacUnidadeMapper.toCreateDto(apiUnidadeData);

    const novaUnidade = await this.prisma.sipacUnidade.create({
      data: unidadeDto
    });
    this.logger.log(
      `Unidade '${sigla}' (ID: ${novaUnidade.id}) persistida com sucesso.`
    );
    return novaUnidade;
  }

  async getOrCreateUnidadeBySigla(
    sigla: string | undefined | null,
    tipoUnidade: 'requisitante' | 'custo'
  ): Promise<{ id: number } | null> {
    this.logger.log(
      `Locando ou criando unidade ${tipoUnidade} com sigla: ${sigla}`
    );

    if (!sigla || sigla.trim() === '') {
      this.logger.warn(
        `Sigla da unidade ${tipoUnidade} está vazia ou ausente.`
      );
      return null;
    }
    try {
      const unidade = await this.findOrCreateUnidadeBySigla(sigla);
      return { id: unidade.id };
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.error(
          `Falha ao obter ou criar unidade ${tipoUnidade} '${sigla}': ${error.message}`
        );
        throw new BadRequestException(
          `Unidade ${tipoUnidade} '${sigla}' não encontrada e não pôde ser criada via SIPAC. Detalhe: ${error.message}`
        );
      }
      this.logger.error(
        `Erro inesperado ao processar unidade ${tipoUnidade} '${sigla}': ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
