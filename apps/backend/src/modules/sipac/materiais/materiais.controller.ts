import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  Get
} from '@nestjs/common';
import { MateriaisService } from './materiais.service';

@Controller('sipac/materiais') // Exemplo de rota
export class MateriaisController {
  private readonly logger = new Logger(MateriaisController.name);

  constructor(private readonly materiaisService: MateriaisService) {}

  // @Post('sync') // POST /sipac/materiais/sync
  // @HttpCode(HttpStatus.ACCEPTED) // Retorna 202 Accepted, pois é uma tarefa demorada
  // async triggerSincronizacao() {
  //   this.logger.log(
  //     'Requisição para iniciar sincronização manual de materiais recebida.'
  //   );
  //   // Não aguardar a conclusão para responder rapidamente à requisição.
  //   // A tarefa rodará em background.
  //   this.materiaisService
  //     .triggerSync()
  //     .then(() =>
  //       this.logger.log(
  //         'Sincronização manual de materiais iniciada em background.'
  //       )
  //     )
  //     .catch((err) =>
  //       this.logger.error(
  //         'Erro ao disparar sincronização manual de materiais.',
  //         err.stack
  //       )
  //     );

  //   return {
  //     message:
  //       'Sincronização de materiais do SIPAC iniciada. Verifique os logs para o progresso.'
  //   };
  // }

  //inserir um GET para retornar os registros, apenas para testes
  @Get() // GET /sipac/materiais
  async findAll() {
    // Implemente a busca no seu banco de dados local
    // return this.materiaisService.findAllFromDb();

    return this.materiaisService.testFetchMateriais();
  }
}
