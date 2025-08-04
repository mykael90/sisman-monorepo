import { Module } from '@nestjs/common';
import { LogErrorService } from './log-error.service';

@Module({
  providers: [LogErrorService],
  exports: [LogErrorService],
})
export class LogErrorModule {}
