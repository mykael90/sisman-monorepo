import { Module } from '@nestjs/common';
import { WorkersContractsController } from './workers-contracts.controller';
import { WorkersContractsService } from './workers-contracts.service';

@Module({
  controllers: [WorkersContractsController],
  providers: [WorkersContractsService],
  exports: [WorkersContractsService]
})
export class WorkersContractsModule {}
