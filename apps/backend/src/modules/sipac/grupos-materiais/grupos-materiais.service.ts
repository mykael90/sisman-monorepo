import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@sisman/prisma';
import { SipacApiService } from '../sipac-api.service';
import {
  SipacGrupoMaterialResponseItem,
  SipacPaginatedResponse,
  SyncResult
} from '../sipac-api.interfaces';
import {
  CreateManySipacGrupoMaterialDto,
  CreateSipacGrupoMaterialDto
} from './dto/sipac-grupo-material.dto';
import { SipacGrupoMaterialMapper } from './mappers/sipac-grupo-material.mapper';

@Injectable()
export class GruposMateriaisService {
  private readonly logger = new Logger(GruposMateriaisService.name);
  private readonly ITEMS_PER_PAGE = 100; // Limite da API externa
  private readonly URL_PATH = 'material/v1/grupos-materiais';

  constructor(
    private readonly prisma: PrismaService,
    private readonly sipacHttp: SipacApiService
  ) {}

  // @Cron(
  //   process.env.CRON_SIPAC_GRUPOS_MATERIAIS_SYNC || '0 0 * * *' // Daily at midnight
  // )
  // async handleCronSyncGruposMateriais() {
  //   this.logger.log(
  //     'Iniciando sincronização agendada de grupos de materiais do SIPAC...'
  //   );
  //   const result = await this.fetchAllAndPersistGruposMateriais();
  //   this.logger.log(
  //     `Sincronização agendada de grupos de materiais do SIPAC concluída. Total processado: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
  //   );
  // }

  private async persistManyGruposMateriais(
    data: CreateManySipacGrupoMaterialDto
  ): Promise<void> {
    try {
      const result = await this.prisma.sipacGrupoMaterial.createMany({
        data: data.items,
        skipDuplicates: true
      });
      this.logger.log(
        `Grupos de Materiais persistidos/atualizados com sucesso.`
      );

      const response = {
        created: result.count,
        skipped: data.items.length - result.count
      };

      this.logger.log(
        `${response.created} grupos de materiais criados e ${response.skipped} já existentes`
      );

      return;
    } catch (error) {
      this.logger.error(
        `Erro ao persistir lote de grupos de materiais: ${error.message}`,
        error.stack
      );
      // Tratar erros de transação, talvez individualmente se necessário.
    }
  }

  async fetchAllAndPersistGruposMateriais(): Promise<SyncResult> {
    this.logger.log('Buscando todos os grupos de materiais do SIPAC...');
    let currentPage = 1;
    let offset = 0;
    let totalPages = 1;
    let successfulPersists = 0;
    let failedPersists = 0;

    try {
      // First request to get total pages
      this.logger.log(`Buscando grupos de materiais - Página: ${currentPage}`);
      const initialResponse = await this.sipacHttp.get<
        SipacGrupoMaterialResponseItem[]
      >(
        this.URL_PATH, // Adjusted endpoint
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

      const gruposMateriaisDaPagina = initialResponse.data;
      if (gruposMateriaisDaPagina && gruposMateriaisDaPagina.length > 0) {
        this.logger.log(
          `Recebidos ${gruposMateriaisDaPagina.length} grupos de materiais na página ${currentPage}. Persistindo...`
        );
        const createManyDto: CreateManySipacGrupoMaterialDto = {
          items: gruposMateriaisDaPagina.map((item) =>
            SipacGrupoMaterialMapper.toCreateDto(item)
          )
        };
        try {
          await this.persistManyGruposMateriais(createManyDto);
          successfulPersists += gruposMateriaisDaPagina.length;
        } catch (persistError) {
          this.logger.error(
            `Erro ao persistir grupos de materiais da página ${currentPage}: ${persistError.message}`,
            persistError.stack
          );
          failedPersists += gruposMateriaisDaPagina.length;
        }
      } else {
        this.logger.log(
          `Nenhum grupo de material encontrado na página ${currentPage}. Finalizando busca.`
        );
      }

      currentPage++;
      offset = (currentPage - 1) * this.ITEMS_PER_PAGE;

      // Loop for subsequent pages
      while (currentPage <= totalPages) {
        this.logger.log(
          `Buscando grupos de materiais - Página: ${currentPage}`
        );
        const response = await this.sipacHttp.get<
          SipacGrupoMaterialResponseItem[]
        >(
          this.URL_PATH, // Adjusted endpoint
          {
            offset,
            limit: this.ITEMS_PER_PAGE,
            ativo: true
          },
          {
            paginado: 'true'
          }
        );

        const gruposMateriaisSubsequentes = response.data;
        if (
          gruposMateriaisSubsequentes &&
          gruposMateriaisSubsequentes.length > 0
        ) {
          this.logger.log(
            `Recebidos ${gruposMateriaisSubsequentes.length} grupos de materiais na página ${currentPage}. Persistindo...`
          );
          const createManyDto: CreateManySipacGrupoMaterialDto = {
            items: gruposMateriaisSubsequentes.map((item) =>
              SipacGrupoMaterialMapper.toCreateDto(item)
            )
          };
          try {
            await this.persistManyGruposMateriais(createManyDto);
            successfulPersists += gruposMateriaisSubsequentes.length;
          } catch (persistError) {
            this.logger.error(
              `Erro ao persistir grupos de materiais da página ${currentPage}: ${persistError.message}`,
              persistError.stack
            );
            failedPersists += gruposMateriaisSubsequentes.length;
          }
        } else {
          this.logger.log(
            `Nenhum grupo de material encontrado na página ${currentPage}. Finalizando busca.`
          );
        }
        currentPage++;
        offset = (currentPage - 1) * this.ITEMS_PER_PAGE;
      }
    } catch (error) {
      this.logger.error(
        `Erro geral ao buscar ou persistir grupos de materiais: ${error.message}`,
        error.stack
      );
      return {
        totalProcessed: successfulPersists + failedPersists,
        successful: successfulPersists,
        failed: failedPersists
      };
    }
    this.logger.log(
      `Sincronização de grupos de materiais do SIPAC concluída. Total processado: ${successfulPersists + failedPersists}, Sucesso: ${successfulPersists}, Falhas: ${failedPersists}.`
    );
    return {
      totalProcessed: successfulPersists + failedPersists,
      successful: successfulPersists,
      failed: failedPersists
    };
  }

  async fetchManyByCodesAndPersistGruposMateriais(
    codigos: number[] // Changed to number[] for codes
  ): Promise<SyncResult> {
    this.logger.log(
      `Iniciando busca e persistência de múltiplos grupos de materiais por código do SIPAC. Total de códigos: ${codigos.length}`
    );
    let totalProcessed = 0;
    let successful = 0;
    let failed = 0;

    for (const code of codigos) {
      const result = await this.fetchByCodeAndPersistGrupoMaterial(code);
      totalProcessed += result.totalProcessed;
      successful += result.successful;
      failed += result.failed;
    }
    this.logger.log(
      `Concluída a busca e persistência de múltiplos grupos de materiais por código do SIPAC. Total processado: ${totalProcessed}, Sucesso: ${successful}, Falhas: ${failed}.`
    );
    return {
      totalProcessed,
      successful,
      failed
    };
  }

  async fetchByCodeAndPersistGrupoMaterial(
    codigo: number
  ): Promise<SyncResult> {
    // Changed to number for code
    this.logger.log(
      `Buscando e persistindo grupo de material do SIPAC com código: ${codigo}...`
    );
    let successfulPersists = 0;
    let failedPersists = 0;

    try {
      const response = await this.sipacHttp.get<
        SipacGrupoMaterialResponseItem[]
      >(
        this.URL_PATH, // Adjusted endpoint
        {
          offset: 0,
          limit: 1,
          ativo: true,
          codigo: codigo
        },
        {
          paginado: 'true'
        }
      );

      const grupoMaterial = response.data[0];
      if (grupoMaterial) {
        this.logger.log(
          `Grupo de material com código ${codigo} encontrado. Persistindo...`
        );
        const createManyDto: CreateManySipacGrupoMaterialDto = {
          items: [SipacGrupoMaterialMapper.toCreateDto(grupoMaterial)]
        };
        try {
          await this.persistManyGruposMateriais(createManyDto);
          successfulPersists++;
          this.logger.log(
            `Grupo de material com código ${codigo} persistido com sucesso.`
          );
        } catch (persistError) {
          this.logger.error(
            `Erro ao persistir grupo de material com código ${codigo}: ${persistError.message}`,
            persistError.stack
          );
          failedPersists++;
        }
      } else {
        this.logger.log(
          `Nenhum grupo de material encontrado para o código ${codigo}.`
        );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao buscar ou persistir grupo de material com código ${codigo}: ${error.message}`,
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
   * Busca uma pequena quantidade de grupos de materiais da API do SIPAC para teste de conexão.
   * Não persiste os dados.
   * @returns A resposta paginada da API do SIPAC contendo os grupos de materiais.
   */
  async testFetchGruposMateriais() {
    const offset = 0;
    const limit = 100;

    this.logger.log(
      'Iniciando teste de busca de grupos de materiais do SIPAC...'
    );
    try {
      const result = await this.sipacHttp.get<SipacGrupoMaterialResponseItem[]>(
        this.URL_PATH, // Adjusted endpoint
        {
          offset,
          limit,
          ativo: true
        },
        {
          paginado: 'true'
        }
      );
      this.logger.log(
        'Teste de busca de grupos de materiais do SIPAC concluído com sucesso.'
      );
      const { headers, data } = result;

      const response: SipacPaginatedResponse<SipacGrupoMaterialResponseItem> = {
        items: data,
        totalItems: headers['x-total'],
        offset: offset,
        limit: limit,
        totalPages: headers['x-pages']
      };

      const createDto: CreateSipacGrupoMaterialDto =
        SipacGrupoMaterialMapper.toCreateDto(response.items[0]);

      const createManyDto: CreateManySipacGrupoMaterialDto = {
        items: response.items.map((item) => {
          return SipacGrupoMaterialMapper.toCreateDto(item);
        })
      };

      // await this.persistManyGruposMateriais(createManyDto);

      return createManyDto;
    } catch (error) {
      this.logger.error(
        'Erro durante o teste de busca de grupos de materiais do SIPAC.',
        error.stack
      );
      throw error;
    }
  }
}
