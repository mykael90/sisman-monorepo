import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { Prisma } from '@sisman/prisma';
import { SismanLegacyApiService } from './sisman-legacy-api.service';
import { SismanLegacyMaterialOutResponseItem } from './sisman-legacy-api.interfaces';
import { MaterialWithdrawalMapper } from './mappers/materials-withdrawal.mapper';
import { MaterialWithdrawalsService } from '../material-withdrawals/material-withdrawals.service';

export interface SyncResult {
  totalProcessed: number;
  successful: number;
  failed: number;
}

@Injectable()
export class SismanLegacyService {
  private readonly logger = new Logger(SismanLegacyService.name);

  constructor(
    private readonly sismanLegacyHttp: SismanLegacyApiService,
    private readonly materialWithdrawalMapper: MaterialWithdrawalMapper,
    private readonly materialWithdrawalsService: MaterialWithdrawalsService
  ) {}

  async testFetchSismanLegacy(relativePath: string) {
    this.logger.log('Iniciando teste de busca no sisman legado...');
    try {
      const result = await this.sismanLegacyHttp.get<any>(
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

  async importAndPersistManyMaterialsOut(
    relativePath: string
  ): Promise<SyncResult> {
    this.logger.log(
      `Iniciando importação de retiradas de material de: ${relativePath}`
    );
    const sismanLegacyMaterialOut: SismanLegacyMaterialOutResponseItem[] =
      await this.testFetchSismanLegacy(relativePath);

    let successful = 0;
    let failed = 0;

    for (const item of sismanLegacyMaterialOut) {
      try {
        this.logger.debug(`Mapeando item de retirada legado ID: ${item.id}`);
        const createDto = await this.materialWithdrawalMapper.toCreateDto(item);

        this.logger.debug(`Persistindo item de retirada legado ID: ${item.id}`);
        await this.materialWithdrawalsService.create(createDto);

        successful++;
      } catch (error) {
        failed++;
        this.logger.error(
          `Falha ao importar item de retirada legado ID: ${item.id}. Erro: ${error.message}`,
          error.stack
        );
      }
    }

    const result: SyncResult = {
      totalProcessed: sismanLegacyMaterialOut.length,
      successful,
      failed
    };

    this.logger.log(
      `Importação de retiradas concluída. Processados: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
    );

    return result;
  }
}
