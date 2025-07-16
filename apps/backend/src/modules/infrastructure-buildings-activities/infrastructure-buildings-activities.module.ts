import { Module } from '@nestjs/common';
import { InfrastructureBuildingsActivitiesController } from './infrastructure-buildings-activities.controller';
import { InfrastructureBuildingsActivitiesService } from './infrastructure-buildings-activities.service';

@Module({
  controllers: [InfrastructureBuildingsActivitiesController],
  providers: [InfrastructureBuildingsActivitiesService],
  exports: [InfrastructureBuildingsActivitiesService]
})
export class InfrastructureBuildingsActivitiesModule {}
