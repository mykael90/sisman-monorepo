import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { Prisma } from '@sisman/prisma';
import { SismanLegacyApiService } from './sisman-legacy-api.service';
import {
  SismanLegacyMaterialInResponseItem,
  SismanLegacyMaterialOutItem,
  SismanLegacyMaterialOutResponseItem
} from './sisman-legacy-api.interfaces';
import { MaterialWithdrawalMapper } from './mappers/materials-withdrawal.mapper';
import { MaterialWithdrawalItemMapper } from './mappers/materials-withdrawal-items.mapper';
import { MaterialReceiptMapper } from './mappers/materials-receipt.mapper';
import { WorkerManualFrequencyMapper } from './mappers/workers-manual-frequencies.mapper';
import { SismanLegacyWorkerManualFrequencyResponse } from './sisman-legacy-api.interfaces';

export interface FailedImport {
  id: number | string;
  error: string;
}

export interface SyncResult {
  totalProcessed: number;
  successful: number;
  failed: number | FailedImport[];
}

@Injectable()
export class SismanLegacyService {
  private readonly logger = new Logger(SismanLegacyService.name);

  constructor(
    private readonly sismanLegacyHttp: SismanLegacyApiService,
    private readonly materialWithdrawalMapper: MaterialWithdrawalMapper,
    private readonly materialReceiptMapper: MaterialReceiptMapper,
    private readonly workerManualFrequencyMapper: WorkerManualFrequencyMapper,
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
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
    const failedItems: FailedImport[] = [];

    if (sismanLegacyMaterialOut.length === 0) {
      this.logger.log('Nenhum item de retirada de material para importar.');
      return { totalProcessed: 0, successful: 0, failed: [] };
    }

    const createDtos = await Promise.all(
      sismanLegacyMaterialOut.map(
        async (item) => await this.materialWithdrawalMapper.toCreateDto(item)
      )
    );

    for (const dto of createDtos) {
      try {
        // Supondo que 'id' exista ou seja gerado após a criação
        await this.prisma.materialWithdrawal.create({ data: dto });
        successful++;
      } catch (error: any) {
        failedItems.push({
          // Você precisará de um identificador único no DTO para isso
          id: (dto as any).id || 'unknown_id', // Ajuste conforme a estrutura do seu DTO
          error: error.message
        });
      }
    }

    const result: SyncResult = {
      totalProcessed: sismanLegacyMaterialOut.length,
      successful,
      // Se `failedItems` tem algo, significa que o lote inteiro falhou.
      // Caso contrário, calculamos as falhas (que deve ser 0 se o lote teve sucesso).
      failed:
        failedItems.length > 0
          ? failedItems
          : sismanLegacyMaterialOut.length - successful
    };

    this.logger.log(
      `Importação de retiradas concluída. Processados: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
    );

    return result;
  }

  //esse método é para os items da retirada
  async importAndPersistManyMaterialsItemsOut(
    relativePath: string
  ): Promise<SyncResult> {
    this.logger.log(
      `Iniciando importação de retiradas de material de: ${relativePath}`
    );
    const sismanLegacyMaterialItemOut: SismanLegacyMaterialOutItem[] =
      await this.testFetchSismanLegacy(relativePath);

    let successful = 0;
    const failedItems: FailedImport[] = [];

    if (sismanLegacyMaterialItemOut.length === 0) {
      this.logger.log('Nenhum item de retirada de material para importar.');
      return { totalProcessed: 0, successful: 0, failed: [] };
    }

    const createDtos = sismanLegacyMaterialItemOut.map((item) =>
      MaterialWithdrawalItemMapper.toCreateDto(item)
    );

    for (const dto of createDtos) {
      try {
        // Supondo que 'id' exista ou seja gerado após a criação
        await this.prisma.materialWithdrawalItem.create({ data: dto });
        successful++;
      } catch (error: any) {
        failedItems.push({
          // Você precisará de um identificador único no DTO para isso
          id: (dto as any).id || 'unknown_id', // Ajuste conforme a estrutura do seu DTO
          error: error.message
        });
      }
    }

    const result: SyncResult = {
      totalProcessed: sismanLegacyMaterialItemOut.length,
      successful,
      // Se `failedItems` tem algo, significa que o lote inteiro falhou.
      // Caso contrário, calculamos as falhas (que deve ser 0 se o lote teve sucesso).
      failed:
        failedItems.length > 0
          ? failedItems
          : sismanLegacyMaterialItemOut.length - successful
    };

    this.logger.log(
      `Importação de retiradas concluída. Processados: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
    );

    return result;
  }

  async importAndPersistManyMaterialsIn(
    relativePath: string
  ): Promise<SyncResult> {
    this.logger.log(
      `Iniciando importação de entradas de material de: ${relativePath}`
    );
    const sismanLegacyMaterialIn: SismanLegacyMaterialInResponseItem[] =
      await this.testFetchSismanLegacy(relativePath);

    let successful = 0;
    const failedItems: FailedImport[] = [];

    if (sismanLegacyMaterialIn.length === 0) {
      this.logger.log('Nenhum item de entrada de material para importar.');
      return { totalProcessed: 0, successful: 0, failed: [] };
    }

    const createDtos = await Promise.all(
      sismanLegacyMaterialIn.map(
        async (item) => await this.materialReceiptMapper.toCreateDto(item)
      )
    );

    for (const dto of createDtos) {
      try {
        // Supondo que 'id' exista ou seja gerado após a criação
        await this.prisma.materialReceipt.create({ data: dto });
        successful++;
      } catch (error: any) {
        failedItems.push({
          // Você precisará de um identificador único no DTO para isso
          id: (dto as any).id || 'unknown_id', // Ajuste conforme a estrutura do seu DTO
          error: error.message
        });
      }
    }

    const result: SyncResult = {
      totalProcessed: sismanLegacyMaterialIn.length,
      successful,
      failed:
        failedItems.length > 0
          ? failedItems
          : sismanLegacyMaterialIn.length - successful
    };

    this.logger.log(
      `Importação de entradas concluída. Processados: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
    );

    return result;
  }

  async importAndPersistManyWorkerManualFrequency(
    relativePath: string
  ): Promise<SyncResult> {
    this.logger.log(
      `Iniciando importação de frequências manuais de trabalhadores de: ${relativePath}`
    );
    const sismanLegacyWorkerManualFrequencies: SismanLegacyWorkerManualFrequencyResponse[] =
      await this.testFetchSismanLegacy(relativePath);

    let successful = 0;
    const failedItems: FailedImport[] = [];

    if (sismanLegacyWorkerManualFrequencies.length === 0) {
      this.logger.log(
        'Nenhuma frequência manual de trabalhador para importar.'
      );
      return { totalProcessed: 0, successful: 0, failed: [] };
    }

    const createDtos = await Promise.all(
      sismanLegacyWorkerManualFrequencies.map(
        async (item) => await this.workerManualFrequencyMapper.toCreateDto(item)
      )
    );

    for (const dto of createDtos) {
      try {
        await this.prisma.workerManualFrequency.create({ data: dto });
        successful++;
      } catch (error: any) {
        failedItems.push({
          id: (dto as any).workerId || 'unknown_id',
          error: error.message
        });
      }
    }

    const result: SyncResult = {
      totalProcessed: sismanLegacyWorkerManualFrequencies.length,
      successful,
      failed:
        failedItems.length > 0
          ? failedItems
          : sismanLegacyWorkerManualFrequencies.length - successful
    };

    this.logger.log(
      `Importação de frequências manuais de trabalhadores concluída. Processados: ${result.totalProcessed}, Sucesso: ${result.successful}, Falhas: ${result.failed}.`
    );

    return result;
  }
}
