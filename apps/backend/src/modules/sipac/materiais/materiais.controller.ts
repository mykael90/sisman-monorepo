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
import { MateriaisService } from './materiais.service';

@Controller('sipac/materiais') // Exemplo de rota
export class MateriaisController {
  private readonly logger = new Logger(MateriaisController.name);

  constructor(private readonly materiaisService: MateriaisService) {}

  //inserir um GET para retornar os registros, apenas para testes
  @Get() // GET /sipac/materiais
  async findAll() {
    // Implemente a busca no seu banco de dados local
    // return this.materiaisService.findAllFromDb();

    return this.materiaisService.testFetchMateriais();
  }

  @Get('sync-all') // GET /sipac/materiais/sync-all
  @HttpCode(HttpStatus.ACCEPTED) // Retorna 202 Accepted, pois é uma tarefa demorada
  async triggerSyncAll() {
    this.logger.log(
      'Requisição para iniciar sincronização manual de materiais recebida.'
    );
    // Não aguardar a conclusão para responder rapidamente à requisição.
    // A tarefa rodará em background.
    this.materiaisService
      .fetchAllAndPersistMateriais()
      .then((value) => {
        this.logger.log(`${JSON.stringify(value, null, 2)}`);
      })
      .catch((err) =>
        this.logger.error(
          'Erro ao disparar sincronização manual de materiais.',
          err.stack
        )
      );

    return {
      message:
        'Sincronização de materiais do SIPAC iniciada em background. Verifique os logs para o progresso.'
    };
  }

  @Get(':codigo') // GET
  async triggerSyncOne(@Param('codigo') codigo: string) {
    return await this.materiaisService.fetchByCodeAndPersistMaterial(codigo);
  }

  @Post('sync-many') // POST /sipac/materiais/sync-many
  async triggerSyncMany(@Body('codigos') codigos: string[]) {
    return await this.materiaisService.fetchManyByCodesAndPersistMaterials(
      codigos
    );
  }
}
