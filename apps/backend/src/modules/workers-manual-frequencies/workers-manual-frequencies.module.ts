import { Module } from '@nestjs/common';
import { WorkersManualFrequenciesController } from './workers-manual-frequencies.controller';
import { WorkersManualFrequenciesService } from './workers-manual-frequencies.service';

@Module({
  controllers: [WorkersManualFrequenciesController],
  providers: [WorkersManualFrequenciesService],
  exports: [WorkersManualFrequenciesService]
})
export class WorkersManualFrequenciesModule {}
