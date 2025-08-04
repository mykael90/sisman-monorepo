// src/shared/observability/observability.module.ts
import { Module, Global } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Global() // Torna o MetricsService disponível globalmente sem precisar importar o módulo em todo lugar
@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService], // Exporta o serviço para ser injetado em outros módulos/serviços
})
export class ObservabilityModule {}
