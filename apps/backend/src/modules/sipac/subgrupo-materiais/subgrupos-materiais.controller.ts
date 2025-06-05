import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  Param,
  Body
} from '@nestjs/common';
import { SubGruposMateriaisService } from './subgrupos-materiais.service';

@Controller('sipac/subgrupos-materiais') // Exemplo de rota
export class SubGruposMateriaisController {
  private readonly logger = new Logger(SubGruposMateriaisController.name);

  constructor(
    private readonly subGruposMateriaisService: SubGruposMateriaisService
  ) {}

  //inserir um GET para retornar os registros, apenas para testes
  @Get() // GET /sipac/subgrupos-materiais
  async findAll() {
    // Implemente a busca no seu banco de dados local
    // return this.subGruposMateriaisService.findAllFromDb();

    return this.subGruposMateriaisService.testFetchSubGruposMateriais();
  }

  @Get('sync-all') // GET /sipac/subgrupos-materiais/sync-all
  @HttpCode(HttpStatus.ACCEPTED) // Retorna 202 Accepted, pois é uma tarefa demorada
  async triggerSyncAll() {
    this.logger.log(
      'Requisição para iniciar sincronização manual de subgrupos de materiais recebida.'
    );
    // Não aguardar a conclusão para responder rapidamente à requisição.
    // A tarefa rodará em background.
    this.subGruposMateriaisService
      .fetchAllAndPersistSubGruposMateriais()
      .then((value) => {
        this.logger.log(`${JSON.stringify(value, null, 2)}`);
      })
      .catch((err) =>
        this.logger.error(
          'Erro ao disparar sincronização manual de subgrupos de materiais.',
          err.stack
        )
      );

    return {
      message:
        'Sincronização de subgrupos de materiais do SIPAC iniciada em background. Verifique os logs para o progresso.'
    };
  }

  @Get(':codigo') // GET
  async triggerSyncOne(@Param('codigo') codigo: number) {
    return await this.subGruposMateriaisService.fetchByCodeAndPersistSubGrupoMaterial(
      codigo
    );
  }

  @Post('sync-many') // POST /sipac/subgrupos-materiais/sync-many
  async triggerSyncMany(@Body() body: { codigos: number[] }) {
    return await this.subGruposMateriaisService.fetchManyByCodesAndPersistSubGruposMateriais(
      body.codigos
    );
  }
}
