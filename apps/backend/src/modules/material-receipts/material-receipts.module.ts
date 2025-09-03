import { Module } from '@nestjs/common';
import { MaterialReceiptsController } from './material-receipts.controller';
import { MaterialReceiptsService } from './material-receipts.service';
import { MaterialStockMovementsModule } from '../material-stock-movements/material-stock-movements.module';
import { MaterialRestrictionOrdersModule } from '../material-restriction-orders/material-restriction-orders.module';

@Module({
  imports: [MaterialStockMovementsModule, MaterialRestrictionOrdersModule],
  controllers: [MaterialReceiptsController],
  providers: [MaterialReceiptsService],
  exports: [MaterialReceiptsService]
})
export class MaterialReceiptsModule {}
