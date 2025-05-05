// src/shared/observability/metrics.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

@Controller('metrics') // Endpoint padrão para Prometheus
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', this.metricsService.registry.contentType);
    res.end(await this.metricsService.registry.metrics());
  }
}
