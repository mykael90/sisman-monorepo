import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Query,
  Res,
  StreamableFile
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FotoService } from './foto.service';
import { Response } from 'express';
import { FetchFotoDto } from './dto/foto.dto';
import { ApiEndpointSwagger } from '../../../shared/decorators/swagger/api-endpoint.decorator';

@ApiTags('SIPAC - Fotos')
@Controller('sipac/foto')
export class FotoController {
  private readonly logger = new Logger(FotoController.name);

  constructor(private readonly fotoService: FotoService) {}

  @Get()
  @ApiEndpointSwagger({
    summary: 'Busca uma foto do SIPAC',
    description:
      'Retorna a imagem de uma foto específica do SIPAC com base no idProducao e na key.',
    response: {
      status: HttpStatus.OK,
      description: 'A imagem da foto.',
      content: {
        'image/jpeg': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    },
    errors: [
      { status: HttpStatus.NOT_FOUND, description: 'Foto não encontrada.' },
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Erro interno do servidor.'
      }
    ]
  })
  async getFoto(
    @Query() { idProducao, key }: FetchFotoDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    this.logger.log(
      `idProducao recebido: '${idProducao}', tipo: ${typeof idProducao}`
    );
    this.logger.log(`key recebida: '${key}', tipo: ${typeof key}`);
    try {
      const imageBuffer = await this.fotoService.fetchFotoSipac(
        idProducao,
        key
      );
      // Define o cabeçalho apenas no caminho de sucesso
      res.setHeader('Content-Type', 'image/jpeg');
      return new StreamableFile(imageBuffer);
    } catch (error) {
      this.logger.error(
        `Erro durante a busca de foto no SIPAC com idProducao: ${idProducao}.`,
        error.stack
      );
      // Lança o erro para que o Exception Filter do NestJS o capture
      // e formate uma resposta JSON de erro padronizada.
      throw error;
    }
  }
}
