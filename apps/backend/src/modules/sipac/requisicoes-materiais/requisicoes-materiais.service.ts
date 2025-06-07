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
  SyncResult
} from '../sipac-scraping.interfaces';
import {
  CreateManySipacListaRequisicaoMaterialDto as CreateManySipacRequisicaoMaterialDto,
  CreateSipacListaRequisicaoMaterialDto,
  UpdateSipacRequisicaoMaterialDto
} from './dto/sipac-requisicao-material.dto';
import {
  SipacListaRequisicaoMaterialMapper,
  SipacRequisicaoMaterialMapper
} from './mappers/sipac-requisicao-material.mapper';
import { AxiosRequestConfig } from 'axios';
import { handlePrismaError } from '../../../shared/utils/prisma-error-handler';

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

        // 2. Verificar se a chave é uma relação para definir com 'set'
        if (
          relationalKeysFromDMMF.includes(typedKey) &&
          Array.isArray(value) // 'value' deve ser um array (pode ser vazio para remover todas as conexões)
        ) {
          const relationDataToSet = value;

          // Usar 'set' para criar completamente as conexões existentes
          (prismaUpdateInput as any)[typedKey] = {
            set: relationDataToSet
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
      const request = await this.sipacScraping.get<
        SipacSingleScrapingResponse<SipacRequisicaoMaterialResponseItem>
      >(this.URL_PATH, {
        ...this.CONSTANT_PARAMS,
        id,
        requisicao: id
      });
      this.logger.log(
        `Busca e persistência da requisição de material do SIPAC com ID: ${id} concluída com sucesso.`
      );
      const { data } = request;

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

      const updateDto: UpdateSipacRequisicaoMaterialDto =
        SipacRequisicaoMaterialMapper.toUpdateDto(result.data);

      const updateRequisicaoMaterial =
        await this.persistUpdateRequisicaoMaterial(id, updateDto);

      return updateRequisicaoMaterial;
    } catch (error) {
      this.logger.error(
        `Erro durante a busca e persistência da requisição de material do SIPAC com ID: ${id}.`,
        error.stack
      );
      throw error;
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
}
