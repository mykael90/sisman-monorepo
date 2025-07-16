import { Module } from '@nestjs/common';
import { InfrastructureFacilitiesComplexesController } from './infrastructure-facilities-complexes.controller';
import { InfrastructureFacilitiesComplexesService } from './infrastructure-facilities-complexes.service';

@Module({
  controllers: [InfrastructureFacilitiesComplexesController],
  providers: [InfrastructureFacilitiesComplexesService],
  exports: [InfrastructureFacilitiesComplexesService]
})
export class InfrastructureFacilitiesComplexesModule {}
