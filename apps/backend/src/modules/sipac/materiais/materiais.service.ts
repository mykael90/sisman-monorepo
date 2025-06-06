import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@sisman/prisma';
import { SipacApiService } from '../sipac-api.service';
import {
  SipacMaterialResponseItem,
  SipacPaginatedResponse,
  SyncResult
} from '../sipac-api.interfaces';
import {
  CreateManySipacMaterialDto,
  CreateSipacMaterialDto
} from './dto/sipac-material.dto';
import { SipacMaterialMapper } from './mappers/sipac-material.mapper';

@Injectable()
export class MateriaisService {
  private readonly logger = new Logger(MateriaisService.name);
  private readonly ITEMS_PER_PAGE = 100; // Limite da API externa
  private readonly URL_PATH = 'material/v1/materiais';

  constructor(
    private readonly prisma: PrismaService,
    private readonly sipacHttp: SipacApiService
  ) {}

  // @Cron(
  //   process.env.CRON_SIPAC_MATERIAIS_SYNC || '0 0 * * *' // Daily at midnight
  // )
  // async handleCronSyncMateriais() {
  //   this.logger.log(
  //     'Iniciando sincronização agendada de materiais do SIPAC...'
  //   );
  //   const result = await this.fetchAllAndPersistMateriais();
  //   this.logger.log(
  //     `Sincronização agendada de materiais do SIPAC concluída. Total processado: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
  //   );
  // }

  private async persistManyMateriais(
    data: CreateManySipacMaterialDto
  ): Promise<void> {
    try {
      const result = await this.prisma.sipacMaterial.createMany({
        data: data.items,
        skipDuplicates: true
      });
      this.logger.log(`Materiais persistidos/atualizados com sucesso.`);

      const response = {
        created: result.count,
        skipped: data.items.length - result.count
      };

      this.logger.log(
        `${response.created} materiais criados e ${response.skipped} já existentes`
      );

      return;
    } catch (error) {
      this.logger.error(
        `Erro ao persistir lote de materiais: ${error.message}`,
        error.stack
      );
      // Tratar erros de transação, talvez individualmente se necessário.
    }
  }

  async fetchAllAndPersistMateriais(): Promise<SyncResult> {
    this.logger.log('Buscando todos os materiais do SIPAC...');
    let currentPage = 1;
    let offset = 0;
    let totalPages = 1;
    let successfulPersists = 0;
    let failedPersists = 0;

    try {
      // First request to get total pages
      this.logger.log(`Buscando materiais - Página: ${currentPage}`);
      const initialResponse = await this.sipacHttp.get<
        SipacMaterialResponseItem[]
      >(
        this.URL_PATH,
        {
          offset,
          limit: this.ITEMS_PER_PAGE,
          ativo: true
        },
        {
          paginado: 'true'
        }
      );

      const initialHeaders = initialResponse.headers;
      totalPages = parseInt(initialHeaders['x-pages'], 10) || 1;
      this.logger.log(`Total de páginas a processar: ${totalPages}`);

      const materiaisDaPagina = initialResponse.data;
      if (materiaisDaPagina && materiaisDaPagina.length > 0) {
        this.logger.log(
          `Recebidos ${materiaisDaPagina.length} materiais na página ${currentPage}. Persistindo...`
        );
        const createManyDto: CreateManySipacMaterialDto = {
          items: materiaisDaPagina.map((item) =>
            SipacMaterialMapper.toCreateDto(item)
          )
        };
        try {
          await this.persistManyMateriais(createManyDto);
          successfulPersists += materiaisDaPagina.length;
        } catch (persistError) {
          this.logger.error(
            `Erro ao persistir materiais da página ${currentPage}: ${persistError.message}`,
            persistError.stack
          );
          failedPersists += materiaisDaPagina.length;
        }
      } else {
        this.logger.log(
          `Nenhum material encontrado na página ${currentPage}. Finalizando busca.`
        );
      }

      currentPage++;
      offset = (currentPage - 1) * this.ITEMS_PER_PAGE;

      // Loop for subsequent pages
      while (currentPage <= totalPages) {
        this.logger.log(`Buscando materiais - Página: ${currentPage}`);
        const response = await this.sipacHttp.get<SipacMaterialResponseItem[]>(
          this.URL_PATH,
          {
            offset,
            limit: this.ITEMS_PER_PAGE,
            ativo: true
          },
          {
            paginado: 'true'
          }
        );

        const materiaisSubsequentes = response.data;
        if (materiaisSubsequentes && materiaisSubsequentes.length > 0) {
          this.logger.log(
            `Recebidos ${materiaisSubsequentes.length} materiais na página ${currentPage}. Persistindo...`
          );
          const createManyDto: CreateManySipacMaterialDto = {
            items: materiaisSubsequentes.map((item) =>
              SipacMaterialMapper.toCreateDto(item)
            )
          };
          try {
            await this.persistManyMateriais(createManyDto);
            successfulPersists += materiaisSubsequentes.length;
          } catch (persistError) {
            this.logger.error(
              `Erro ao persistir materiais da página ${currentPage}: ${persistError.message}`,
              persistError.stack
            );
            failedPersists += materiaisSubsequentes.length;
          }
        } else {
          this.logger.log(
            `Nenhum material encontrado na página ${currentPage}. Finalizando busca.`
          );
        }
        currentPage++;
        offset = (currentPage - 1) * this.ITEMS_PER_PAGE;
      }
    } catch (error) {
      this.logger.error(
        `Erro geral ao buscar ou persistir materiais: ${error.message}`,
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
      `Sincronização de materiais do SIPAC concluída. Total processado: ${successfulPersists + failedPersists}, Sucesso: ${successfulPersists}, Falhas: ${failedPersists}.`
    );
    return {
      totalProcessed: successfulPersists + failedPersists,
      successful: successfulPersists,
      failed: failedPersists
    };
  }

  async fetchManyByCodesAndPersistMaterials(
    codigos: string[]
  ): Promise<SyncResult> {
    this.logger.log(
      `Iniciando busca e persistência de múltiplos materiais por código do SIPAC. Total de códigos: ${codigos.length}`
    );
    let totalProcessed = 0;
    let successful = 0;
    let failed = 0;

    for (const code of codigos) {
      const result = await this.fetchByCodeAndPersistMaterial(code);
      totalProcessed += result.totalProcessed;
      successful += result.successful;
      failed += result.failed;
    }
    this.logger.log(
      `Concluída a busca e persistência de múltiplos materiais por código do SIPAC. Total processado: ${totalProcessed}, Sucesso: ${successful}, Falhas: ${failed}.`
    );
    return {
      totalProcessed,
      successful,
      failed
    };
  }

  async fetchByCodeAndPersistMaterial(codigo: string): Promise<SyncResult> {
    this.logger.log(
      `Buscando e persistindo material do SIPAC com código: ${codigo}...`
    );
    let successfulPersists = 0;
    let failedPersists = 0;

    try {
      const response = await this.sipacHttp.get<SipacMaterialResponseItem[]>(
        this.URL_PATH,
        {
          offset: 0, // Always 0 for a single code search
          limit: 1, // Only expect one item
          ativo: true,
          codigo: codigo
        },
        {
          paginado: 'true'
        }
      );

      const material = response.data[0]; // Expecting a single item in the array
      if (material) {
        this.logger.log(
          `Material com código ${codigo} encontrado. Persistindo...`
        );
        const createManyDto: CreateManySipacMaterialDto = {
          items: [SipacMaterialMapper.toCreateDto(material)]
        };
        try {
          await this.persistManyMateriais(createManyDto);
          successfulPersists++;
          this.logger.log(
            `Material com código ${codigo} persistido com sucesso.`
          );
        } catch (persistError) {
          this.logger.error(
            `Erro ao persistir material com código ${codigo}: ${persistError.message}`,
            persistError.stack
          );
          failedPersists++;
        }
      } else {
        this.logger.log(`Nenhum material encontrado para o código ${codigo}.`);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao buscar ou persistir material com código ${codigo}: ${error.message}`,
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
   * Busca uma pequena quantidade de materiais da API do SIPAC para teste de conexão.
   * Não persiste os dados.
   * @returns A resposta paginada da API do SIPAC contendo os materiais.
   */
  async testFetchMateriais() {
    const offset = 0;
    const limit = 100;

    this.logger.log('Iniciando teste de busca de materiais do SIPAC...');
    try {
      const result = await this.sipacHttp.get<SipacMaterialResponseItem[]>(
        this.URL_PATH,
        {
          offset,
          limit,
          ativo: true
          // codigo: 3024000000359,
          // precisa ser o código completo, não pega só uma parte
        },
        {
          paginado: 'true'
        }
      );
      this.logger.log(
        'Teste de busca de materiais do SIPAC concluído com sucesso.'
      );
      const { headers, data } = result;

      const response: SipacPaginatedResponse<SipacMaterialResponseItem> = {
        items: data,
        totalItems: headers['x-total'],
        offset: offset,
        limit: limit,
        totalPages: headers['x-pages']
      };

      const createDto: CreateSipacMaterialDto = SipacMaterialMapper.toCreateDto(
        response.items[0]
      );

      const createManyDto: CreateManySipacMaterialDto = {
        items: response.items.map((item) => {
          return SipacMaterialMapper.toCreateDto(item);
        })
      };

      // await this.persistManyMateriais(createManyDto);

      return createManyDto;
    } catch (error) {
      this.logger.error(
        'Erro durante o teste de busca de materiais do SIPAC.',
        error.stack
      );
      throw error; // Re-lança o erro para ser tratado por quem chamou
    }
  }
}
