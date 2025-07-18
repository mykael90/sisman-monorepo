import { Module } from '@nestjs/common';
import { MaintenanceRequestsService } from './maintenance-requests.service';
import { MaintenanceRequestsController } from './maintenance-requests.controller';
import { InfrastructureBuildingsModule } from '../infrastructure-buildings/infrastructure-buildings.module';

@Module({
  imports: [InfrastructureBuildingsModule],
  controllers: [MaintenanceRequestsController],
  providers: [MaintenanceRequestsService],
  exports: [MaintenanceRequestsService]
})
export class MaintenanceRequestsModule {}
