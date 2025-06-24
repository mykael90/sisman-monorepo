// Em: src/sipac/get-file.service.ts

import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SipacService } from './sipac.service';
import { ImageParserService } from './html-parser/image-parser.service';

@Injectable()
export class GetFileService {
  private readonly logger = new Logger(GetFileService.name);

  constructor(
    private readonly sipacService: SipacService,
    private readonly imageParserService: ImageParserService,
  ) {}

  /**
   * Orquestra a busca do arquivo.
   * A lógica agora é simples: obter os cookies corretos e pedir o arquivo.
   * @param producaoPageUrl A URL final no sigaa.ufrn.br que serve o arquivo.
   */
  async getArquivoDeProducao(producaoPageUrl: string): Promise<Blob> {
    try {
      // ETAPA 1: Obter os cookies de uma sessão totalmente ativa no SIGAA.
      // Toda a complexidade (escolha de vínculo, etc.) está aqui dentro.
      this.logger.log('Step 1: Getting a fully active SIGAA session...');
      await this.sipacService.getAuthCookies('sigaa');
      this.logger.log('SIGAA Session is active.');

      // ETAPA 2: Chamar o ImageParserService para buscar a URL diretamente.
      // Ele já sabe obter os cookies do cache e lidar com a resposta.
      // O 'referer' não é mais tão crítico, mas podemos mantê-lo por segurança.
      this.logger.log(`Step 2: Fetching file directly from ${producaoPageUrl}`);
      const fileBlob = await this.imageParserService.getImageBlob(
        producaoPageUrl,
        this.sipacService.getBaseSigaaUrl(), // Use a URL base do SIGAA como referer genérico
      );

      this.logger.log('File successfully retrieved as a Blob.');
      return fileBlob;
    } catch (error) {
      this.logger.error(
        `Failed to get production file: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to retrieve the file: ${error.message}`,
      );
    }
  }
}
