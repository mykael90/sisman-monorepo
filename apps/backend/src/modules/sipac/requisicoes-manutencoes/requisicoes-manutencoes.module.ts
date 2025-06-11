import { forwardRef, Module } from '@nestjs/common';
import { ListaRequisicoesManutencoesService } from './lista-requisicoes-manutencoes.service';
import { RequisicoesManutencoesController } from './requisicoes-manutencoes.controller';
import { SipacModule } from '../sipac.module';
import { RequisicoesManutencoesService } from './requisicoes-manutencoes.service';
import { RequisicoesMateriaisService } from '../requisicoes-materiais/requisicoes-materiais.service';
import { RequisicoesMateriaisModule } from '../requisicoes-materiais/requisicoes-materiais.module';
// import { MateriaisService } from '../materiais/materiais.service'; // TODO: Determine if MateriaisService is needed
// The SipacModule already exports SipacHttpService and PrismaModule is global

@Module({
  imports: [forwardRef(() => SipacModule), RequisicoesMateriaisModule],
  controllers: [RequisicoesManutencoesController],
  providers: [
    ListaRequisicoesManutencoesService,
    RequisicoesManutencoesService
    // MateriaisService // TODO: Include if MateriaisService is needed
  ],
  exports: [ListaRequisicoesManutencoesService, RequisicoesManutencoesService] // Export services if needed by other modules
})
export class RequisicoesManutencoesModule {}
