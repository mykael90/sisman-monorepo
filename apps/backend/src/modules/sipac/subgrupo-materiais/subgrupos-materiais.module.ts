import { forwardRef, Module } from '@nestjs/common';
import { SubGruposMateriaisService } from './subgrupos-materiais.service';
import { SubGruposMateriaisController } from './subgrupos-materiais.controller';
import { SipacModule } from '../sipac.module';
// O SipacModule já exporta o SipacHttpService e o PrismaModule é global

@Module({
  imports: [forwardRef(() => SipacModule)],
  controllers: [SubGruposMateriaisController], // Adicione se tiver controller
  providers: [SubGruposMateriaisService],
  exports: [SubGruposMateriaisService] // Se outro módulo precisar usar este serviço
})
export class SubGruposMateriaisModule {}
