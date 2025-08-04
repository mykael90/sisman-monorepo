import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@sisman/prisma';
import { SipacApiService } from '../sipac-api.service';
import {
  SipacSubGrupoMaterialResponseItem,
  SipacPaginatedResponse,
  SyncResult
} from '../sipac-api.interfaces';
import {
  CreateManySipacSubGrupoMaterialDto,
  CreateSipacSubGrupoMaterialDto
} from '@sisman/types/backend';
import { SipacSubGrupoMaterialMapper } from './mappers/sipac-subgrupo-material.mapper';

@Injectable()
export class SubGruposMateriaisService {
  private readonly logger = new Logger(SubGruposMateriaisService.name);
  private readonly URL_PATH = 'material/v1/sub-grupos-materiais';
  private readonly ITEMS_PER_PAGE = 100; // Limite da API externa

  constructor(
    private readonly prisma: PrismaService,
    private readonly sipacHttp: SipacApiService
  ) {}

  // @Cron(
  //   process.env.CRON_SIPAC_SUBGRUPOS_MATERIAIS_SYNC || '0 0 * * *' // Daily at midnight
  // )
  // async handleCronSyncSubGruposMateriais() {
  //   this.logger.log(
  //     'Iniciando sincronização agendada de subgrupos de materiais do SIPAC...'
  //   );
  //   const result = await this.fetchAllAndPersistSubGruposMateriais();
  //   this.logger.log(
  //     `Sincronização agendada de subgrupos de materiais do SIPAC concluída. Total processado: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
  //   );
  // }

  private async persistManySubGruposMateriais(
    data: CreateManySipacSubGrupoMaterialDto
  ): Promise<void> {
    try {
      const result = await this.prisma.sipacSubGrupoMaterial.createMany({
        data: data.items,
        skipDuplicates: true
      });
      this.logger.log(
        `Subgrupos de Materiais persistidos/atualizados com sucesso.`
      );

      const response = {
        created: result.count,
        skipped: data.items.length - result.count
      };

      this.logger.log(
        `${response.created} subgrupos de materiais criados e ${response.skipped} já existentes`
      );

      return;
    } catch (error) {
      this.logger.error(
        `Erro ao persistir lote de subgrupos de materiais: ${error.message}`,
        error.stack
      );
      // Tratar erros de transação, talvez individualmente se necessário.
    }
  }

  async fetchAllAndPersistSubGruposMateriais(): Promise<SyncResult> {
    this.logger.log('Buscando todos os subgrupos de materiais do SIPAC...');
    let currentPage = 1;
    let offset = 0;
    let totalPages = 1;
    let successfulPersists = 0;
    let failedPersists = 0;

    try {
      // First request to get total pages
      this.logger.log(
        `Buscando subgrupos de materiais - Página: ${currentPage}`
      );
      const initialResponse = await this.sipacHttp.get<
        SipacSubGrupoMaterialResponseItem[]
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

      const subGruposMateriaisDaPagina = initialResponse.data;
      if (subGruposMateriaisDaPagina && subGruposMateriaisDaPagina.length > 0) {
        this.logger.log(
          `Recebidos ${subGruposMateriaisDaPagina.length} subgrupos de materiais na página ${currentPage}. Persistindo...`
        );
        const createManyDto: CreateManySipacSubGrupoMaterialDto = {
          items: subGruposMateriaisDaPagina.map((item) =>
            SipacSubGrupoMaterialMapper.toCreateDto(item)
          )
        };
        try {
          await this.persistManySubGruposMateriais(createManyDto);
          successfulPersists += subGruposMateriaisDaPagina.length;
        } catch (persistError) {
          this.logger.error(
            `Erro ao persistir subgrupos de materiais da página ${currentPage}: ${persistError.message}`,
            persistError.stack
          );
          failedPersists += subGruposMateriaisDaPagina.length;
        }
      } else {
        this.logger.log(
          `Nenhum subgrupo de material encontrado na página ${currentPage}. Finalizando busca.`
        );
      }

      currentPage++;
      offset = (currentPage - 1) * this.ITEMS_PER_PAGE;

      // Loop for subsequent pages
      while (currentPage <= totalPages) {
        this.logger.log(
          `Buscando subgrupos de materiais - Página: ${currentPage}`
        );
        const response = await this.sipacHttp.get<
          SipacSubGrupoMaterialResponseItem[]
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

        const subGruposMateriaisSubsequentes = response.data;
        if (
          subGruposMateriaisSubsequentes &&
          subGruposMateriaisSubsequentes.length > 0
        ) {
          this.logger.log(
            `Recebidos ${subGruposMateriaisSubsequentes.length} subgrupos de materiais na página ${currentPage}. Persistindo...`
          );
          const createManyDto: CreateManySipacSubGrupoMaterialDto = {
            items: subGruposMateriaisSubsequentes.map((item) =>
              SipacSubGrupoMaterialMapper.toCreateDto(item)
            )
          };
          try {
            await this.persistManySubGruposMateriais(createManyDto);
            successfulPersists += subGruposMateriaisSubsequentes.length;
          } catch (persistError) {
            this.logger.error(
              `Erro ao persistir subgrupos de materiais da página ${currentPage}: ${persistError.message}`,
              persistError.stack
            );
            failedPersists += subGruposMateriaisSubsequentes.length;
          }
        } else {
          this.logger.log(
            `Nenhum subgrupo de material encontrado na página ${currentPage}. Finalizando busca.`
          );
        }
        currentPage++;
        offset = (currentPage - 1) * this.ITEMS_PER_PAGE;
      }
    } catch (error) {
      this.logger.error(
        `Erro geral ao buscar ou persistir subgrupos de materiais: ${error.message}`,
        error.stack
      );
      return {
        totalProcessed: successfulPersists + failedPersists,
        successful: successfulPersists,
        failed: failedPersists
      };
    }
    this.logger.log(
      `Sincronização de subgrupos de materiais do SIPAC concluída. Total processado: ${successfulPersists + failedPersists}, Sucesso: ${successfulPersists}, Falhas: ${failedPersists}.`
    );
    return {
      totalProcessed: successfulPersists + failedPersists,
      successful: successfulPersists,
      failed: failedPersists
    };
  }

  async fetchManyByCodesAndPersistSubGruposMateriais(
    codigos: number[]
  ): Promise<SyncResult> {
    this.logger.log(
      `Iniciando busca e persistência de múltiplos subgrupos de materiais por código do SIPAC. Total de códigos: ${codigos.length}`
    );
    let totalProcessed = 0;
    let successful = 0;
    let failed = 0;

    for (const code of codigos) {
      const result = await this.fetchByCodeAndPersistSubGrupoMaterial(code);
      totalProcessed += result.totalProcessed;
      successful += result.successful;
      failed += result.failed;
    }
    this.logger.log(
      `Concluída a busca e persistência de múltiplos subgrupos de materiais por código do SIPAC. Total processado: ${totalProcessed}, Sucesso: ${successful}, Falhas: ${failed}.`
    );
    return {
      totalProcessed,
      successful,
      failed
    };
  }

  async fetchByCodeAndPersistSubGrupoMaterial(
    codigo: number
  ): Promise<SyncResult> {
    this.logger.log(
      `Buscando e persistindo subgrupo de material do SIPAC com código: ${codigo}...`
    );
    let successfulPersists = 0;
    let failedPersists = 0;

    try {
      const response = await this.sipacHttp.get<
        SipacSubGrupoMaterialResponseItem[]
      >(
        this.URL_PATH, // Adjusted endpoint
        {
          offset: 0,
          limit: 1,
          codigo: codigo
        },
        {
          paginado: 'true'
        }
      );

      const subGrupoMaterial = response.data[0];
      if (subGrupoMaterial) {
        this.logger.log(
          `Subgrupo de material com código ${codigo} encontrado. Persistindo...`
        );
        const createManyDto: CreateManySipacSubGrupoMaterialDto = {
          items: [SipacSubGrupoMaterialMapper.toCreateDto(subGrupoMaterial)]
        };
        try {
          await this.persistManySubGruposMateriais(createManyDto);
          successfulPersists++;
          this.logger.log(
            `Subgrupo de material com código ${codigo} persistido com sucesso.`
          );
        } catch (persistError) {
          this.logger.error(
            `Erro ao persistir subgrupo de material com código ${codigo}: ${persistError.message}`,
            persistError.stack
          );
          failedPersists++;
        }
      } else {
        this.logger.log(
          `Nenhum subgrupo de material encontrado para o código ${codigo}.`
        );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao buscar ou persistir subgrupo de material com código ${codigo}: ${error.message}`,
        error.stack
      );
      failedPersists++;
    }
    return {
      totalProcessed: successfulPersists + failedPersists,
      successful: successfulPersists,
      failed: failedPersists
    };
  }

  /**
   * Busca uma pequena quantidade de subgrupos de materiais da API do SIPAC para teste de conexão.
   * Não persiste os dados.
   * @returns A resposta paginada da API do SIPAC contendo os subgrupos de materiais.
   */
  async testFetchSubGruposMateriais() {
    const offset = 0;
    const limit = 100;

    this.logger.log(
      'Iniciando teste de busca de subgrupos de materiais do SIPAC...'
    );
    try {
      const result = await this.sipacHttp.get<
        SipacSubGrupoMaterialResponseItem[]
      >(
        this.URL_PATH, // Adjusted endpoint
        {
          offset,
          limit
        },
        {
          paginado: 'true'
        }
      );
      this.logger.log(
        'Teste de busca de subgrupos de materiais do SIPAC concluído com sucesso.'
      );
      const { headers, data } = result;

      const response: SipacPaginatedResponse<SipacSubGrupoMaterialResponseItem> =
        {
          items: data,
          totalItems: headers['x-total'],
          offset: offset,
          limit: limit,
          totalPages: headers['x-pages']
        };

      const createDto: CreateSipacSubGrupoMaterialDto =
        SipacSubGrupoMaterialMapper.toCreateDto(response.items[0]);

      const createManyDto: CreateManySipacSubGrupoMaterialDto = {
        items: response.items.map((item) => {
          return SipacSubGrupoMaterialMapper.toCreateDto(item);
        })
      };

      // await this.persistManySubGruposMateriais(createManyDto);

      return createManyDto;
    } catch (error) {
      this.logger.error(
        'Erro durante o teste de busca de subgrupos de materiais do SIPAC.',
        error.stack
      );
      throw error;
    }
  }
}
