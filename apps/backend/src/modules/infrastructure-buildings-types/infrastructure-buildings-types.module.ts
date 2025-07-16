import { Module } from '@nestjs/common';
import { InfrastructureBuildingTypesController } from './infrastructure-buildings-types.controller';
import { InfrastructureBuildingTypesService } from './infrastructure-buildings-types.service';

@Module({
  controllers: [InfrastructureBuildingTypesController],
  providers: [InfrastructureBuildingTypesService],
  exports: [InfrastructureBuildingTypesService]
})
export class InfrastructureBuildingTypesModule {}
