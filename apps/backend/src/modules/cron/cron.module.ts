import { Module } from '@nestjs/common';
import { ExampleTask } from './tasks/example-task.task';
import { MaterialPickingOrdersModule } from '../material-picking-orders/material-picking-orders.module';
import { ExpireMaterialPickingOrdersTask } from './tasks/expire-material-picking-orders.task';

@Module({
  imports: [MaterialPickingOrdersModule],
  providers: [
    // ExampleTask,
    ExpireMaterialPickingOrdersTask
  ]
})
export class CronModule {}
