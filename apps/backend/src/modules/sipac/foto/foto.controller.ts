import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Query,
  Res,
  StreamableFile
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FotoService } from './foto.service';
import { Response } from 'express';

@ApiTags('SIPAC - Fotos')
@Controller('sipac/foto')
export class FotoController {
  private readonly logger = new Logger(FotoController.name);

  constructor(private readonly fotoService: FotoService) {}

  @Get()
  @ApiOperation({
    summary: 'Busca uma foto do SIPAC',
    description:
      'Retorna a imagem de uma foto específica do SIPAC com base no idProducao e na key.'
  })
  @ApiQuery({
    name: 'idProducao',
    required: true,
    type: String,
    description: 'O ID de produção da foto no SIPAC.'
  })
  @ApiQuery({
    name: 'key',
    required: true,
    type: String,
    description: 'A chave de acesso para a foto no SIPAC.'
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Foto não encontrada.'
  })
  async getFoto(
    @Query('idProducao') idProducao: string,
    @Query('key') key: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
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
