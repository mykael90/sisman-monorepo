import { forwardRef, Module } from '@nestjs/common';
import { UnidadesService } from './unidades.service';
import { UnidadesController } from './unidades.controller';
import { SipacModule } from '../sipac.module';
// O SipacModule já exporta o SipacHttpService e o PrismaModule é global

@Module({
  imports: [forwardRef(() => SipacModule)],
  controllers: [UnidadesController], // Adicione se tiver controller
  providers: [UnidadesService],
  exports: [UnidadesService] // Se outro módulo precisar usar este serviço
})
export class UnidadesModule {}
