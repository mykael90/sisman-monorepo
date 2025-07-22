import { Module } from '@nestjs/common';
import { MaterialWithdrawalsController } from './material-withdrawals.controller';
import { MaterialWithdrawalsService } from './material-withdrawals.service';
import { MaterialStockMovementsModule } from '../material-stock-movements/material-stock-movements.module';

@Module({
  imports: [MaterialStockMovementsModule],
  controllers: [MaterialWithdrawalsController],
  providers: [MaterialWithdrawalsService],
  exports: [MaterialWithdrawalsService]
})
export class MaterialWithdrawalsModule {}
