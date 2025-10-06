import { Module } from '@nestjs/common';
import { WorkersManualFrequenciesTypesController } from './workers-manual-frequencies-types.controller';
import { WorkersManualFrequenciesTypesService } from './workers-manual-frequencies-types.service';

@Module({
  controllers: [WorkersManualFrequenciesTypesController],
  providers: [WorkersManualFrequenciesTypesService],
  exports: [WorkersManualFrequenciesTypesService]
})
export class WorkersManualFrequenciesTypesModule {}
