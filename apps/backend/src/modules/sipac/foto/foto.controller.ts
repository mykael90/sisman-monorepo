import {
  Controller,
  Get,
  Header,
  HttpStatus,
  Query,
  StreamableFile
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FotoService } from './foto.service';

@ApiTags('SIPAC - Fotos')
@Controller('sipac/foto')
export class FotoController {
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
  @Header('Content-Type', 'image/jpeg')
  async getFoto(
    @Query('idProducao') idProducao: string,
    @Query('key') key: string
  ): Promise<StreamableFile> {
    const imageBuffer = await this.fotoService.fetchFotoSipac(idProducao, key);
    return new StreamableFile(imageBuffer);
  }
}
