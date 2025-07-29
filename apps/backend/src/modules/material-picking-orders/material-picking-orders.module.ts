import { Module } from '@nestjs/common';
import { MaterialPickingOrdersController } from './material-picking-orders.controller';
import { MaterialPickingOrdersService } from './material-picking-orders.service';
import { MaterialStockMovementsModule } from '../material-stock-movements/material-stock-movements.module';
import { MaterialRequestsModule } from '../material-requests/material-requests.module';
import { WarehousesModule } from '../warehouses/warehouses.module';

@Module({
  imports: [
    MaterialStockMovementsModule,
    MaterialRequestsModule,
    WarehousesModule
  ],
  controllers: [MaterialPickingOrdersController],
  providers: [MaterialPickingOrdersService],
  exports: [MaterialPickingOrdersService]
})
export class MaterialPickingOrdersModule {}
