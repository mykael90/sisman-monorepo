import { Module } from '@nestjs/common';
import { WorkersContractsController } from './workers-contracts.controller';
import { WorkersContractsService } from './workers-contracts.service';
import { WorkersModule } from '../workers/workers.module';

@Module({
  controllers: [WorkersContractsController],
  providers: [WorkersContractsService],
  exports: [WorkersContractsService],
  imports: [WorkersModule]
})
export class WorkersContractsModule {}
