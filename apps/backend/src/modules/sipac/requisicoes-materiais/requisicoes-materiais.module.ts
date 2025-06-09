import { forwardRef, Module } from '@nestjs/common';
import { ListaRequisicoesMateriaisService } from './lista-requisicoes-materiais.service';
import { RequisicoesMateriaisController } from './requisicoes-materiais.controller';
import { SipacModule } from '../sipac.module';
import { RequisicoesMateriaisService } from './requisicoes-materiais.service';
import { MateriaisService } from '../materiais/materiais.service';
// O SipacModule já exporta o SipacHttpService e o PrismaModule é global

@Module({
  imports: [forwardRef(() => SipacModule)],
  controllers: [RequisicoesMateriaisController], // Adicione se tiver controller
  providers: [
    ListaRequisicoesMateriaisService,
    RequisicoesMateriaisService,
    MateriaisService
  ],
  exports: [ListaRequisicoesMateriaisService, RequisicoesMateriaisService] // Se outro módulo precisar usar este serviço
})
export class RequisicoesMateriaisModule {}
