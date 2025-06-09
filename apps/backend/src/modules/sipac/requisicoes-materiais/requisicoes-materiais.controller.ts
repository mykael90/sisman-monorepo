import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  Param,
  Body,
  Query,
  Put,
  ParseIntPipe
} from '@nestjs/common';
import { ListaRequisicoesMateriaisService } from './lista-requisicoes-materiais.service';
import { RequisicoesMateriaisService } from './requisicoes-materiais.service';

@Controller('sipac/requisicoes-materiais') // Exemplo de rota
export class RequisicoesMateriaisController {
  private readonly logger = new Logger(RequisicoesMateriaisController.name);

  constructor(
    private readonly listaRequisicoesMateriaisService: ListaRequisicoesMateriaisService,
    private readonly requisicoesMateriaisService: RequisicoesMateriaisService
  ) {}

  @Get()
  async findAll() {
    return this.requisicoesMateriaisService.list();
  }

  //inserir um GET para retornar os registros, apenas para testes
  // @Get() // GET /sipac/requisicoes-materiais
  // async findAll(
  //   @Query('dataInicial') dataInicial: string,
  //   @Query('dataFinal') dataFinal: string
  // ) {
  //   // Implemente a busca no seu banco de dados local
  //   // return this.requisicoesMateriaisService.findAllFromDb();

  //   return this.listaRequisicoesMateriaisService.testFetchListaRequisicoesMateriais(
  //     dataInicial,
  //     dataFinal
  //   );
  // }

  @Get('list/sync-all') // GET /sipac/requisicoes-materiais/sync-all
  @HttpCode(HttpStatus.ACCEPTED) // Retorna 202 Accepted, pois é uma tarefa demorada
  async triggerSyncAll(
    @Query('dataInicial') dataInicial: string,
    @Query('dataFinal') dataFinal: string
  ) {
    this.logger.log(
      'Requisição para iniciar sincronização manual de requisições de materiais recebida.'
    );
    // Não aguardar a conclusão para responder rapidamente à requisição.
    // A tarefa rodará em background.
    this.listaRequisicoesMateriaisService
      .fetchAllAndPersistListaRequisicoesMateriais(dataInicial, dataFinal)
      .then((value) => {
        this.logger.log(`${JSON.stringify(value, null, 2)}`);
      })
      .catch((err) =>
        this.logger.error(
          'Erro ao disparar sincronização manual de requisições de materiais.',
          err.stack
        )
      );

    return {
      message:
        'Sincronização de requisições de materiais do SIPAC iniciada em background. Verifique os logs para o progresso.'
    };
  }

  @Post('list/sync-one')
  async triggerSyncOne(@Body('numeroAno') numeroAno: string) {
    return await this.listaRequisicoesMateriaisService.fetchByNumeroAnoAndPersistListaRequisicaoMaterial(
      numeroAno
    );
  }

  @Post('list/sync-many') // POST /sipac/requisicoes-materiais/sync-many
  async triggerSyncMany(@Body('numeroAnoArray') numeroAnoArray: string[]) {
    return await this.listaRequisicoesMateriaisService.fetchManyByNumeroAnoAndPersistListaRequisicoesMateriais(
      numeroAnoArray
    );
  }

  @Put(':id')
  async updateOne(@Param('id', ParseIntPipe) id: number) {
    return await this.requisicoesMateriaisService.fetchAndPersistUpsertRequisicaoMaterial(
      id
    );
  }
}
