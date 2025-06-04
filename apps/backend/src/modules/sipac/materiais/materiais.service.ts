import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { SipacHttpService } from '../sipac.service';

// import { SipacMaterialDto } from './dto/sipac-material.dto'; // Se criar DTOs

export interface SipacMaterialResponseItem {
  ativo: boolean;
  codigo: number; // Anteriormente string, agora number conforme a tabela
  'codigo-sidec': number;
  'consumo-energia': number;
  'data-ultima-compra': number; // Timestamp (integer)
  'denominacao-grupo': string;
  'denominacao-material': string; // Corresponde à antiga 'descricao'
  'denominacao-material-ascii': string;
  'denominacao-sub-grupo': string;
  'denominacao-unidade': string; // Corresponde à antiga 'unidadeMedida'
  especificacao: string;
  'especificacao-ascii': string;
  'id-grupo': number;
  'id-material': number; // Corresponde à antiga 'id'
  'id-sub-grupo': number;
  'preco-compra': number;
  'valor-estimado': number;
}

export interface SipacPaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

@Injectable()
export class MateriaisService {
  private readonly logger = new Logger(MateriaisService.name);
  private readonly ITEMS_PER_PAGE = 100; // Limite da API externa

  constructor(
    private readonly prisma: PrismaService,
    private readonly sipacHttp: SipacHttpService,
    private readonly configService: ConfigService
  ) {}

  // @Cron(
  //   process.env.CRON_SIPAC_MATERIAIS_SYNC || CronExpression.DAILY_AT_MIDNIGHT
  // )
  // async handleCronSyncMateriais() {
  //   this.logger.log(
  //     'Iniciando sincronização agendada de materiais do SIPAC...'
  //   );
  //   await this.fetchAllAndPersistMateriais();
  //   this.logger.log('Sincronização agendada de materiais do SIPAC concluída.');
  // }

  // async fetchAllAndPersistMateriais(): Promise<void> {
  //   this.logger.log('Buscando todos os materiais do SIPAC...');
  //   let currentPage = 1;
  //   let hasMorePages = true;
  //   let totalMateriaisProcessados = 0;

  //   while (hasMorePages) {
  //     try {
  //       this.logger.log(`Buscando materiais - Página: ${currentPage}`);
  //       const response = await this.sipacHttp.get<
  //         SipacPaginatedResponse<SipacMaterialResponseItem>
  //       >(
  //         'materiais', // Endpoint específico para materiais
  //         {
  //           page: currentPage,
  //           limit: this.ITEMS_PER_PAGE
  //         }
  //       );

  //       const materiaisDaPagina = response.data.items;
  //       if (materiaisDaPagina && materiaisDaPagina.length > 0) {
  //         this.logger.log(
  //           `Recebidos ${materiaisDaPagina.length} materiais na página ${currentPage}. Persistindo...`
  //         );
  //         await this.persistMateriais(materiaisDaPagina);
  //         totalMateriaisProcessados += materiaisDaPagina.length;

  //         // Verifica se há mais páginas
  //         // A API deve informar o total de páginas ou se é a última
  //         // Exemplo: hasMorePages = response.data.currentPage < response.data.totalPages;
  //         // Ou: hasMorePages = materiaisDaPagina.length === this.ITEMS_PER_PAGE; (supõe que se vier menos, acabou)
  //         hasMorePages = response.data.currentPage < response.data.totalPages; // Ajuste conforme a API real
  //         if (hasMorePages) {
  //           currentPage++;
  //         }
  //       } else {
  //         this.logger.log(
  //           `Nenhum material encontrado na página ${currentPage}. Finalizando busca.`
  //         );
  //         hasMorePages = false;
  //       }
  //     } catch (error) {
  //       this.logger.error(
  //         `Erro ao buscar ou persistir materiais na página ${currentPage}: ${error.message}`,
  //         error.stack
  //       );
  //       // Decidir se quer parar ou tentar a próxima página (cuidado com loops infinitos)
  //       hasMorePages = false; // Parar em caso de erro para evitar problemas maiores
  //     }
  //   }
  //   this.logger.log(
  //     `Total de ${totalMateriaisProcessados} materiais processados do SIPAC.`
  //   );
  // }

  // private async persistMateriais(
  //   materiais: SipacMaterialResponseItem[]
  // ): Promise<void> {
  //   if (!materiais || materiais.length === 0) {
  //     return;
  //   }

  //   // Exemplo de como persistir/atualizar. Adapte à sua lógica (upsert).
  //   // Idealmente, você terá um ID único vindo da API para usar como chave.
  //   const operations = materiais.map((material) => {
  //     return this.prisma.sipacMaterial.upsert({
  //       // Supondo que seu model no Prisma se chama 'material'
  //       where: { codigoSipac: material.codigo }, // Use um campo único do SIPAC
  //       update: {
  //         descricao: material.descricao,
  //         unidadeMedida: material.unidadeMedida
  //         // ... mapear outros campos
  //       },
  //       create: {
  //         codigoSipac: material.codigo,
  //         descricao: material.descricao,
  //         unidadeMedida: material.unidadeMedida
  //         // ... mapear outros campos
  //       }
  //     });
  //   });

  //   try {
  //     await this.prisma.$transaction(operations);
  //     this.logger.log(
  //       `${materiais.length} materiais persistidos/atualizados com sucesso.`
  //     );
  //   } catch (error) {
  //     this.logger.error(
  //       `Erro ao persistir lote de materiais: ${error.message}`,
  //       error.stack
  //     );
  //     // Tratar erros de transação, talvez individualmente se necessário.
  //   }
  // }

  // // Método para trigger manual (opcional, via controller)
  // async triggerSync(): Promise<{ message: string; count?: number }> {
  //   this.logger.log('Sincronização manual de materiais do SIPAC iniciada.');
  //   await this.fetchAllAndPersistMateriais();
  //   // Poderia retornar a contagem de itens processados se o fetchAllAndPersistMateriais retornasse isso.
  //   return {
  //     message: 'Sincronização de materiais do SIPAC concluída com sucesso.'
  //   };
  // }

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
        'material/v1/materiais',
        {
          offset,
          limit
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
        currentPage: offset,
        itemsPerPage: limit,
        totalPages: headers['x-pages']
      };

      return response;
    } catch (error) {
      this.logger.error(
        'Erro durante o teste de busca de materiais do SIPAC.',
        error.stack
      );
      throw error; // Re-lança o erro para ser tratado por quem chamou
    }
  }
}
