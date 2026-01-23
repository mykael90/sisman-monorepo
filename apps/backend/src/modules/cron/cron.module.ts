import { Module } from '@nestjs/common';
import { ExampleTask } from './tasks/example-task.task';
import { MaterialPickingOrdersModule } from '../material-picking-orders/material-picking-orders.module';
import { ExpireMaterialPickingOrdersTask } from './tasks/expire-material-picking-orders.task';
import { RequisicoesManutencoesModule } from '../sipac/requisicoes-manutencoes/requisicoes-manutencoes.module';
import { MaterialRestrictionOrdersModule } from '../material-restriction-orders/material-restriction-orders.module';
import { ReleaseMaterialRestrictionOrdersTask } from './tasks/release-material-restriction-orders.task';

@Module({
  imports: [
    MaterialPickingOrdersModule,
    RequisicoesManutencoesModule,
    MaterialRestrictionOrdersModule
  ],
  providers: [
    // ExampleTask,
    ExpireMaterialPickingOrdersTask,
    ReleaseMaterialRestrictionOrdersTask
  ]
})
export class CronModule {}
