import { Module } from '@nestjs/common';
import { InfrastructureBuildingsController } from './infrastructure-buildings.controller';
import { InfrastructureBuildingsService } from './infrastructure-buildings.service';

@Module({
  controllers: [InfrastructureBuildingsController],
  providers: [InfrastructureBuildingsService],
  exports: [InfrastructureBuildingsService]
})
export class InfrastructureBuildingsModule {}
