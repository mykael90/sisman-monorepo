import { Module } from '@nestjs/common';
import { InfrastructureSpaceTypesController } from './infrastructure-space-types.controller';
import { InfrastructureSpaceTypesService } from './infrastructure-space-types.service';

@Module({
  controllers: [InfrastructureSpaceTypesController],
  providers: [InfrastructureSpaceTypesService],
  exports: [InfrastructureSpaceTypesService]
})
export class InfrastructureSpaceTypesModule {}
