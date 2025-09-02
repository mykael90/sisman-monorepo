import { Module } from '@nestjs/common';
import { MaterialPickingOrdersController } from './material-picking-orders.controller';
import { MaterialPickingOrdersService } from './material-picking-orders.service';
import { MaterialStockMovementsModule } from '../material-stock-movements/material-stock-movements.module';
import { MaterialRequestsModule } from '../material-requests/material-requests.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { MaterialWithdrawalsModule } from '../material-withdrawals/material-withdrawals.module';
import { MaterialRestrictionOrdersModule } from '../material-restriction-orders/material-restriction-orders.module';

@Module({
  imports: [
    MaterialStockMovementsModule,
    MaterialRequestsModule,
    WarehousesModule,
    MaterialWithdrawalsModule, // Adicionado para ter acesso ao MaterialWithdrawalsService
    MaterialRestrictionOrdersModule
  ],
  controllers: [MaterialPickingOrdersController],
  providers: [MaterialPickingOrdersService],
  exports: [MaterialPickingOrdersService]
})
export class MaterialPickingOrdersModule {}
