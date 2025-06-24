import { forwardRef, Module } from '@nestjs/common';
import { FotoService } from './foto.service';
import { FotoController } from './foto.controller';
import { SipacModule } from '../sipac.module';

@Module({
  imports: [forwardRef(() => SipacModule)],
  controllers: [FotoController],
  providers: [FotoService]
})
export class FotoModule {}
