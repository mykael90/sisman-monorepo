import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { Prisma } from '@sisman/prisma';
import { SismanLegacyApiService } from './sisman-legacy-api.service';

@Injectable()
export class SismanLegacyService {
  private readonly logger = new Logger(SismanLegacyService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient,
    private readonly sismanLegacyHttp: SismanLegacyApiService
  ) {}

  async testFetchSismanLegacy(relativePath: string) {
    this.logger.log('Iniciando teste de busca no sisman legado...');
    try {
      const result = await this.sismanLegacyHttp.get<any[]>(
        relativePath // Adjusted endpoint
      );
      this.logger.log('Teste de busca no sisman legado concluído com sucesso.');
      const { headers, data } = result;

      // await this.persistManySismanLegacy(createManyDto);

      return data;
    } catch (error) {
      this.logger.error(
        'Erro durante o teste de busca no sisman legado.',
        error.stack
      );
      throw error;
    }
  }
}
