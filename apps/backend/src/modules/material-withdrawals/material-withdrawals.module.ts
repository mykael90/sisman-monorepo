import { Module } from '@nestjs/common';
import { MaterialWithdrawalsController } from './material-withdrawals.controller';
import { MaterialWithdrawalsService } from './material-withdrawals.service';
import { MaterialStockMovementsModule } from '../material-stock-movements/material-stock-movements.module';
import { MaterialRequestsModule } from '../material-requests/material-requests.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { MaterialRestrictionOrdersModule } from '../material-restriction-orders/material-restriction-orders.module';

@Module({
  imports: [
    MaterialStockMovementsModule,
    MaterialRequestsModule,
    WarehousesModule,
    MaterialRestrictionOrdersModule
  ],
  controllers: [MaterialWithdrawalsController],
  providers: [MaterialWithdrawalsService],
  exports: [MaterialWithdrawalsService]
})
export class MaterialWithdrawalsModule {}
