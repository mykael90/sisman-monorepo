import { forwardRef, Module } from '@nestjs/common';
import { GruposMateriaisService } from './grupos-materiais.service';
import { GruposMateriaisController } from './grupos-materiais.controller';
import { SipacModule } from '../sipac.module';
// O SipacModule já exporta o SipacHttpService e o PrismaModule é global

@Module({
  imports: [forwardRef(() => SipacModule)],
  controllers: [GruposMateriaisController], // Adicione se tiver controller
  providers: [GruposMateriaisService],
  exports: [GruposMateriaisService] // Se outro módulo precisar usar este serviço
})
export class GruposMateriaisModule {}
