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
import { UnidadesService } from './unidades.service';

@Controller('sipac/unidades') // Exemplo de rota
export class UnidadesController {
  private readonly logger = new Logger(UnidadesController.name);

  constructor(private readonly unidadesService: UnidadesService) {}

  //inserir um GET para retornar os registros, apenas para testes
  @Get() // GET /sipac/unidades
  async findAll() {
    // Implemente a busca no seu banco de dados local
    // return this.unidadesService.findAllFromDb();

    return this.unidadesService.testFetchUnidades();
  }

  @Get('sync-all') // GET /sipac/unidades/sync-all
  @HttpCode(HttpStatus.ACCEPTED) // Retorna 202 Accepted, pois é uma tarefa demorada
  async triggerSyncAll() {
    this.logger.log(
      'Requisição para iniciar sincronização manual de unidades recebida.'
    );
    // Não aguardar a conclusão para responder rapidamente à requisição.
    // A tarefa rodará em background.
    this.unidadesService
      .fetchAllAndPersistUnidades()
      .then((value) => {
        this.logger.log(`${JSON.stringify(value, null, 2)}`);
      })
      .catch((err) =>
        this.logger.error(
          'Erro ao disparar sincronização manual de unidades.',
          err.stack
        )
      );

    return {
      message:
        'Sincronização de unidades do SIPAC iniciada em background. Verifique os logs para o progresso.'
    };
  }

  @Get(':codigoUnidade') // GET
  async triggerSyncOne(@Param('codigoUnidade') codigoUnidade: string) {
    return await this.unidadesService.fetchByCodeAndPersistUnidade(
      codigoUnidade
    );
  }

  @Post('sync-many') // POST /sipac/unidades/sync-many
  async triggerSyncMany(@Body('codigosUnidade') codigosUnidade: string[]) {
    return await this.unidadesService.fetchManyByCodesAndPersistUnidades(
      codigosUnidade
    );
  }

  @Post('normalize-all-sipac-unidades-names') // POST /sipac/unidades/sync-many
  async normalizeAllSipacUnidadesNames() {
    return await this.unidadesService.normalizeAllSipacUnidadeNames();
  }
}
