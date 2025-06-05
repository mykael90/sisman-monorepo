import { forwardRef, Module } from '@nestjs/common';
import { MateriaisService } from './materiais.service';
import { MateriaisController } from './materiais.controller';
import { SipacModule } from '../sipac.module';
// O SipacModule já exporta o SipacHttpService e o PrismaModule é global

@Module({
  imports: [forwardRef(() => SipacModule)],
  controllers: [MateriaisController], // Adicione se tiver controller
  providers: [MateriaisService],
  exports: [MateriaisService] // Se outro módulo precisar usar este serviço
})
export class MateriaisModule {}
