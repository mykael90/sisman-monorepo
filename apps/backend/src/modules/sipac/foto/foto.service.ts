import { Injectable, Logger } from '@nestjs/common';
import { SipacScrapingService } from '../sipac-scraping.service';

@Injectable()
export class FotoService {
  private readonly logger = new Logger(FotoService.name);
  private readonly URL_PATH = 'sipac/image';

  // Constant query parameters
  private readonly CONSTANT_PARAMS = {};

  constructor(private readonly sipacScraping: SipacScrapingService) {}

  /**
   * Busca uma foto da API do SIPAC.
   * @param idProducao O ID da produção da foto.
   * @param key A chave de acesso para a foto.
   * @returns Um Buffer com os dados da imagem.
   */
  async fetchFotoSipac(idProducao: string, key: string): Promise<Buffer> {
    this.logger.log(
      `Iniciando busca de foto no SIPAC com idProducao: ${idProducao}`
    );
    try {
      // Para receber um arquivo binário (como uma imagem), definimos responseType como 'arraybuffer'.
      // Em um ambiente Node.js, o Axios retornará um Buffer nos dados da resposta.
      const result = await this.sipacScraping.get<Buffer>(
        this.URL_PATH,
        {
          idProducao,
          key,
          ...this.CONSTANT_PARAMS
        },
        undefined, // headers
        {
          responseType: 'arraybuffer'
        }
      );
      this.logger.log(
        `Foto com idProducao: ${idProducao} buscada com sucesso.`
      );
      const { data } = result;

      return data;
    } catch (error) {
      this.logger.error(
        `Erro durante a busca de foto no SIPAC com idProducao: ${idProducao}.`,
        error.stack
      );
      throw error;
    }
  }
}
