import { Module } from '@nestjs/common';
import { MaterialRestrictionOrdersController } from './material-restriction-orders.controller';
import { MaterialRestrictionOrdersService } from './material-restriction-orders.service';
import { MaterialStockMovementsModule } from '../material-stock-movements/material-stock-movements.module';
import { MaterialRequestsModule } from '../material-requests/material-requests.module';

@Module({
  imports: [MaterialStockMovementsModule, MaterialRequestsModule],
  controllers: [MaterialRestrictionOrdersController],
  providers: [MaterialRestrictionOrdersService],
  exports: [MaterialRestrictionOrdersService]
})
export class MaterialRestrictionOrdersModule {}
