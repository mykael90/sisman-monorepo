import { Module } from '@nestjs/common';

import { ContractProvidersController } from './contract-providers.controller';
import { ContractProvidersService } from './contract-providers.service';

@Module({
  controllers: [ContractProvidersController],
  providers: [ContractProvidersService],
  exports: [ContractProvidersService],
})
export class ContractProvidersModule {}
