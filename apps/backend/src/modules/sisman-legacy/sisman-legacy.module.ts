import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SismanLegacyApiService } from './sisman-legacy-api.service';
import { SismanLegacyService } from './sisman-legagy.service';
import { SismanLegacyController } from './sisman-legacy.controller';
import { MaterialWithdrawalMapper } from './mappers/materials-withdrawal.mapper';
import { MaterialWithdrawalsModule } from '../material-withdrawals/material-withdrawals.module';
import { MaterialReceiptsModule } from '../material-receipts/material-receipts.module';
import { MaterialReceiptMapper } from './mappers/materials-receipt.mapper';
import { WorkerManualFrequencyMapper } from './mappers/workers-manual-frequencies.mapper';
// import { UnidadesModule } from './unidades/unidades.module'; // Exemplo

@Module({
  imports: [
    MaterialWithdrawalsModule,
    MaterialReceiptsModule,
    HttpModule.registerAsync({
      // Configuração assíncrona do HttpModule
      imports: [ConfigModule], // Importa ConfigModule para usar ConfigService
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT', 5000),
        maxRedirects: configService.get<number>('HTTP_MAX_REDIRECTS', 5)
        // Headers padrão podem ser definidos aqui, mas é melhor no SismanLegacyHttpService
        // para incluir lógica de autenticação dinâmica, se necessário.
        // baseURL: configService.get<string>('SISMANLEGACY_API_BASE_URL'), // Pode ser aqui ou no service
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [SismanLegacyController],
  providers: [
    SismanLegacyApiService,
    SismanLegacyService,
    MaterialWithdrawalMapper,
    MaterialReceiptMapper,
    WorkerManualFrequencyMapper
  ], // Logger pode ser útil aqui também
  exports: [SismanLegacyApiService, SismanLegacyService] // Exporta para uso nos submódulos
})
export class SismanLegacyModule {}
