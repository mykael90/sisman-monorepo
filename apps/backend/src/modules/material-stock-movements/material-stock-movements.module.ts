import { Module } from '@nestjs/common';
import { MaterialStockMovementsController } from './material-stock-movements.controller';
import { MaterialStockMovementsService } from './material-stock-movements.service';
import { MaterialWarehouseStocksModule } from '../material-warehouse-stocks/material-warehouse-stocks.module';

@Module({
  imports: [MaterialWarehouseStocksModule],
  controllers: [MaterialStockMovementsController],
  providers: [MaterialStockMovementsService],
  exports: [MaterialStockMovementsService]
})
export class MaterialStockMovementsModule {}
