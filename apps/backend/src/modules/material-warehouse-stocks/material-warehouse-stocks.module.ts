import { Module } from '@nestjs/common';
import { MaterialWarehouseStocksController } from './material-warehouse-stocks.controller';
import { MaterialWarehouseStocksService } from './material-warehouse-stocks.service';

@Module({
  controllers: [MaterialWarehouseStocksController],
  providers: [MaterialWarehouseStocksService], // Add PrismaService here
  exports: [MaterialWarehouseStocksService]
})
export class MaterialWarehouseStocksModule {}
