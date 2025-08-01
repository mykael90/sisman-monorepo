import { Module } from '@nestjs/common';
import { MaintenanceInstancesService } from './maintenance-instances.service';
import { MaintenanceInstancesController } from './maintenance-instances.controller';

@Module({
  controllers: [MaintenanceInstancesController],
  providers: [MaintenanceInstancesService]
})
export class MaintenanceInstancesModule {}
