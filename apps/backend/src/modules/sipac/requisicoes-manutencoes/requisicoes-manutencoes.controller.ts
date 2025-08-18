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
import { ListaRequisicoesManutencoesService } from './lista-requisicoes-manutencoes.service';
import { RequisicoesManutencoesService } from './requisicoes-manutencoes.service';
import { CreateSipacRequisicaoManutencaoCompletoDto } from './dto/sipac-requisicao-manutencao.dto';

@Controller('sipac/requisicoes-manutencoes') // API route for maintenance requisitions
export class RequisicoesManutencoesController {
  private readonly logger = new Logger(RequisicoesManutencoesController.name);

  constructor(
    private readonly listaRequisicoesManutencoesService: ListaRequisicoesManutencoesService,
    private readonly requisicoesManutencoesService: RequisicoesManutencoesService
  ) {}

  @Get()
  async findAll() {
    return this.requisicoesManutencoesService.list();
  }

  // Example endpoint to trigger sync of all maintenance requisitions within a date range
  @Get('list/sync-all')
  @HttpCode(HttpStatus.ACCEPTED) // Return 202 Accepted for long-running tasks
  async triggerSyncAll(
    @Query('dataInicial') dataInicial: string,
    @Query('dataFinal') dataFinal: string
  ) {
    this.logger.log(
      'Requisição para iniciar sincronização manual de requisições de manutenções recebida.'
    );
    // Do not await the completion to respond quickly to the request.
    // The task will run in the background.
    this.listaRequisicoesManutencoesService
      .fetchAllAndPersistListaRequisicoesManutencoes(dataInicial, dataFinal)
      .then((value) => {
        this.logger.log(`${JSON.stringify(value, null, 2)}`);
      })
      .catch((err) =>
        this.logger.error(
          'Erro ao disparar sincronização manual de requisições de manutenções.',
          err.stack
        )
      );

    return {
      message:
        'Sincronização de requisições de manutenções do SIPAC iniciada em background. Verifique os logs para o progresso.'
    };
  }

  @Post('persist-create-one')
  async persistCreateOne(@Body() data: any) {
    return await this.requisicoesManutencoesService.persistCreateRequisicaoManutencao(
      data
    );
  }
  @Put('persist-update-one')
  async persistUpdateOne(@Body() data: any) {
    return await this.requisicoesManutencoesService.persistUpdateRequisicaoManutencao(
      data.id,
      data
    );
  }

  // Example endpoint to trigger sync of a single maintenance requisition by numero/ano
  @Post('list/sync-one')
  async triggerSyncOne(@Body('numeroAno') numeroAno: string) {
    return await this.listaRequisicoesManutencoesService.fetchByNumeroAnoAndPersistListaRequisicaoManutencao(
      numeroAno
    );
  }

  // Example endpoint to fetch a single maintenance requisition list item by numero/ano without persisting
  @Post('list/fetch-one')
  async triggerListFetchOne(@Body('numeroAno') numeroAno: string) {
    return await this.listaRequisicoesManutencoesService.fetchByNumeroAnoAndReturnListaRequisicaoManutencao(
      numeroAno
    );
  }

  // Example endpoint to trigger sync of multiple maintenance requisitions by numero/ano array
  @Post('list/sync-many')
  async triggerSyncMany(@Body('numeroAnoArray') numeroAnoArray: string[]) {
    return await this.listaRequisicoesManutencoesService.fetchManyByNumeroAnoAndPersistListaRequisicoesManutencoes(
      numeroAnoArray
    );
  }

  // Example endpoint to fetch a complete detailed maintenance requisition by numero/ano without persisting
  @Post('fetch-one-complete')
  async triggerFetchOneComplete(@Body('numeroAno') numeroAno: string) {
    return await this.requisicoesManutencoesService.fetchByNumeroAnoAndReturnRequisicaoManutencaoComplete(
      numeroAno
    );
  }

  // Example endpoint to fetch a complete detailed maintenance requisition by numero/ano and persist (create or update)
  @Post('fetch-one-complete-and-persist')
  async triggerFetchOneCompleteAndPersist(
    @Body('numeroAno') numeroAno: string
  ) {
    return await this.requisicoesManutencoesService.fetchCompleteAndPersistCreateOrUpdateRequisicaoManutencao(
      numeroAno
    );
  }

  // Example endpoint to fetch a complete detailed maintenance requisition by numero/ano and persist (create or update)
  @Post('material-fetch-one-complete-and-persist')
  async triggerMaterialFetchOneCompleteAndPersist(
    @Body('numeroAno') numeroAno: string
  ) {
    return await this.requisicoesManutencoesService.fetchCompleteAndPersistCreateOrUpdateRequisicaoMaterialComManutencaoVinculada(
      numeroAno
    );
  }

  // Example endpoint to fetch multiple complete detailed maintenance requisitions by numero/ano array and persist (create or update)
  @Post('fetch-many-complete-and-persist')
  async triggerFetchManyCompleteAndPersist(
    @Body('numeroAnoArray') numeroAnoArray: string[]
  ) {
    return await this.requisicoesManutencoesService.fetchCompleteAndPersistCreateOrUpdateRequisicaoManutencaoArray(
      numeroAnoArray
    );
  }

  // Example endpoint to fetch a detailed maintenance requisition by its database ID
  @Get('fetch-one/:id')
  async triggerFetchOne(@Param('id', ParseIntPipe) id: number) {
    return await this.requisicoesManutencoesService.fetchAndReturnRequisicaoManutencao(
      id
    );
  }

  // Example endpoint to update a detailed maintenance requisition by its database ID (fetches latest data from SIPAC and updates)
  @Put(':id')
  async updateOne(@Param('id', ParseIntPipe) id: number) {
    return await this.requisicoesManutencoesService.fetchAndPersistUpdateRequisicaoManutencao(
      id
    );
  }

  @Get('list/test')
  async test(
    @Query('dataInicial') dataInicial: string,
    @Query('dataFinal') dataFinal: string
  ) {
    return await this.listaRequisicoesManutencoesService.testFetchListaRequisicoesManutencoes(
      dataInicial,
      dataFinal
    );
  }
}
