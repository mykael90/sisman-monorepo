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
import { GruposMateriaisService } from './grupos-materiais.service';

@Controller('sipac/grupos-materiais') // Exemplo de rota
export class GruposMateriaisController {
  private readonly logger = new Logger(GruposMateriaisController.name);

  constructor(
    private readonly gruposMateriaisService: GruposMateriaisService
  ) {}

  //inserir um GET para retornar os registros, apenas para testes
  @Get() // GET /sipac/grupos-materiais
  async findAll() {
    // Implemente a busca no seu banco de dados local
    // return this.gruposMateriaisService.findAllFromDb();

    return this.gruposMateriaisService.testFetchGruposMateriais();
  }

  @Get('sync-all') // GET /sipac/grupos-materiais/sync-all
  @HttpCode(HttpStatus.ACCEPTED) // Retorna 202 Accepted, pois é uma tarefa demorada
  async triggerSyncAll() {
    this.logger.log(
      'Requisição para iniciar sincronização manual de grupos de materiais recebida.'
    );
    // Não aguardar a conclusão para responder rapidamente à requisição.
    // A tarefa rodará em background.
    this.gruposMateriaisService
      .fetchAllAndPersistGruposMateriais()
      .then((value) => {
        this.logger.log(`${JSON.stringify(value, null, 2)}`);
      })
      .catch((err) =>
        this.logger.error(
          'Erro ao disparar sincronização manual de grupos de materiais.',
          err.stack
        )
      );

    return {
      message:
        'Sincronização de grupos de materiais do SIPAC iniciada em background. Verifique os logs para o progresso.'
    };
  }

  @Get(':codigo') // GET
  async triggerSyncOne(@Param('codigo') codigo: number) {
    // Changed to number
    return await this.gruposMateriaisService.fetchByCodeAndPersistGrupoMaterial(
      codigo
    );
  }

  @Post('sync-many') // POST /sipac/grupos-materiais/sync-many
  async triggerSyncMany(@Body() body: { codigos: number[] }) {
    // Changed to number[]
    return await this.gruposMateriaisService.fetchManyByCodesAndPersistGruposMateriais(
      body.codigos
    );
  }
}
