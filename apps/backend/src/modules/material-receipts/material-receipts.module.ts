import { Module } from '@nestjs/common';
import { MaterialReceiptsController } from './material-receipts.controller';
import { MaterialReceiptsService } from './material-receipts.service';
import { MaterialStockMovementsModule } from '../material-stock-movements/material-stock-movements.module';

@Module({
  controllers: [MaterialReceiptsController],
  providers: [MaterialReceiptsService],
  exports: [MaterialReceiptsService]
})
export class MaterialReceiptsModule {}
