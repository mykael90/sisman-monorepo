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
  SismanLegacyMaterialOutItem,
  SismanLegacyMaterialOutResponseItem
} from './sisman-legacy-api.interfaces';
import { MaterialWithdrawalMapper } from './mappers/materials-withdrawal.mapper';
import { MaterialWithdrawalsService } from '../material-withdrawals/material-withdrawals.service';
import { MaterialWithdrawalItemMapper } from './mappers/materials-withdrawal-items.mapper';

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
    private readonly materialWithdrawalsService: MaterialWithdrawalsService,
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
}
