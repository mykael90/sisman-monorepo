import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { SismanLegacyService } from './sisman-legagy.service';

@Controller('sisman-legacy')
export class SismanLegacyController {
  private readonly logger = new Logger(SismanLegacyController.name);

  constructor(private readonly sismanLegacyService: SismanLegacyService) {}

  @Post('test-fetch')
  async testFetch(@Body('relativePath') relativePath: string) {
    this.logger.log(
      `Requisição para testar busca no Sisman Legacy para o caminho: ${relativePath}`
    );
    try {
      const result =
        await this.sismanLegacyService.testFetchSismanLegacy(relativePath);
      this.logger.log('Teste de busca no Sisman Legacy concluído com sucesso.');
      return result;
    } catch (error) {
      this.logger.error('Erro ao testar busca no Sisman Legacy.', error.stack);
      throw error;
    }
  }
  @Post('import-materials-out')
  async importMaterialsOut(@Body('relativePath') relativePath: string) {
    this.logger.log(
      `Importar retiradas de material do Sisman Legacy para o caminho: ${relativePath}`
    );
    try {
      const result =
        await this.sismanLegacyService.importAndPersistManyMaterialsOut(
          relativePath
        );
      this.logger.log('Teste de busca no Sisman Legacy concluído com sucesso.');
      return result;
    } catch (error) {
      this.logger.error('Erro ao testar busca no Sisman Legacy.', error.stack);
      throw error;
    }
  }
  @Post('import-materials-items-out')
  async importMaterialsItemsOut(@Body('relativePath') relativePath: string) {
    this.logger.log(
      `Importar retiradas de items do material out do Sisman Legacy para o caminho: ${relativePath}`
    );
    try {
      const result =
        await this.sismanLegacyService.importAndPersistManyMaterialsItemsOut(
          relativePath
        );
      this.logger.log('Teste de busca no Sisman Legacy concluído com sucesso.');
      return result;
    } catch (error) {
      this.logger.error('Erro ao testar busca no Sisman Legacy.', error.stack);
      throw error;
    }
  }
}
