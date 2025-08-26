import {
  forwardRef,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from '@nestjs/common';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';

@Global()
@Module({
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [WorkersService]
})
export class WorkersModule implements NestModule {
  constructor() {}

  configure(consumer: MiddlewareConsumer) {
    // Pode adicionar middlewares aqui se necessário
  }
}
