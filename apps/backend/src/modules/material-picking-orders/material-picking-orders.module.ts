import { Module } from '@nestjs/common';
import { MaterialPickingOrdersController } from './material-picking-orders.controller';
import { MaterialPickingOrdersService } from './material-picking-orders.service';
import { MaterialStockMovementsModule } from '../material-stock-movements/material-stock-movements.module';

@Module({
  imports: [MaterialStockMovementsModule],
  controllers: [MaterialPickingOrdersController],
  providers: [MaterialPickingOrdersService],
  exports: [MaterialPickingOrdersService]
})
export class MaterialPickingOrdersModule {}
