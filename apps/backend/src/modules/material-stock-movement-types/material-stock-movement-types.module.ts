import { Module } from '@nestjs/common';
import { MaterialStockMovementTypesController } from './material-stock-movement-types.controller';
import { MaterialStockMovementTypesService } from './material-stock-movement-types.service';

@Module({
  controllers: [MaterialStockMovementTypesController],
  providers: [MaterialStockMovementTypesService],
  exports: [MaterialStockMovementTypesService]
})
export class MaterialStockMovementTypesModule {}
