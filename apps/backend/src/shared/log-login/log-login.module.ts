import { Module } from '@nestjs/common';
import { LogLoginService } from './log-login.service';

@Module({
  providers: [LogLoginService],
  exports: [LogLoginService],
})
export class LogLoginModule {}
