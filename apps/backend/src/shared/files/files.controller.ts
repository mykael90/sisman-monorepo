import {
  Controller,
  Get,
  Param,
  Response,
  StreamableFile
} from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('file')
export class FilesController {
  constructor(private readonly fileService: FilesService) {}

  @Get(':id/download')
  async downloadFile(
    @Param('id') id: string,
    @Response({ passthrough: true }) res
  ) {
    const fileData = await this.fileService.getFileStream(id);

    // Configura o Header para que o navegador entenda o tipo do arquivo
    res.set({
      'Content-Type': fileData.mimeType,
      // Se quiser que o navegador baixe o arquivo em vez de exibir:
      'Content-Disposition': `attachment; filename="${fileData.fileName}"`
    });

    return new StreamableFile(fileData.stream);
  }

  @Get(':id/view')
  async viewFile(
    @Param('id') id: string,
    @Response({ passthrough: true }) res
  ) {
    const fileData = await this.fileService.getFileStream(id);

    res.set({
      'Content-Type': fileData.mimeType,
      'Content-Disposition': 'inline', // "inline" tenta exibir no navegador (fotos/pdfs)
      'Cache-Control': `public, max-age=${1 * 365 * 24 * 60 * 60}` // Cache por 1 ano
    });

    return new StreamableFile(fileData.stream);
  }
}
