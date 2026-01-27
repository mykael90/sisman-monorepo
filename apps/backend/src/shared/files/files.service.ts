import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { mkdir, writeFile, stat, access, constants } from 'fs/promises';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { join } from 'path';
import { createReadStream } from 'fs';
import * as sharp from 'sharp';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async upload(file: Express.Multer.File, path: string) {
    // Certifique-se de que o diretório existe ou será criado
    const directory = join(path, '..'); // Diretório do arquivo
    await mkdir(directory, { recursive: true });

    return writeFile(path, file.buffer);
  }

  async getFileStream(id: string) {
    // 1. Busca os metadados no banco para saber o caminho e o tipo
    const attachment = await this.prisma.attachment.findUnique({
      where: { id }
    });

    if (!attachment) throw new NotFoundException('Arquivo não encontrado');

    // 2. Se o arquivo estiver no disco local:
    // const filePath = join(process.cwd(), 'storage', attachment.relatedModel.toLocaleLowerCase(), attachment.storedFileName);
    const filePath = attachment.localPath;

    // Retornamos um objeto com o stream e os metadados necessários para o header
    return {
      stream: createReadStream(filePath),
      mimeType: attachment.fileType + '/' + attachment.fileExtension, // ex: image/jpeg
      fileName: attachment.storedFileName
    };
  }

  /**
   * Verifica registros de imagem sem metadados (width, height, sizeInBytes),
   * lê o arquivo do disco e atualiza o banco de dados.
   */
  async correctImagesWithoutMetadata() {
    this.logger.log(
      'Iniciando varredura para correção de metadados de imagens...'
    );

    const attachmentsToFix = await this.prisma.attachment.findMany({
      where: {
        fileType: { startsWith: 'image/' },
        localPath: { not: null },
        OR: [
          { sizeInBytes: 1 },
          { width: null },
          { width: 0 },
          { height: null },
          { height: 0 }
        ]
      }
    });

    this.logger.log(
      `Encontrados ${attachmentsToFix.length} registros pendentes de análise.`
    );

    let updatedCount = 0;

    for (const att of attachmentsToFix) {
      try {
        if (!att.localPath) continue;

        // 1. Verifica se o arquivo existe usando access (substituto do existsSync)
        try {
          // constants.F_OK verifica se o arquivo é visível/existe
          await access(att.localPath, constants.F_OK);
        } catch (err) {
          this.logger.warn(
            `Arquivo físico não encontrado para ID ${att.id}: ${att.localPath}`
          );
          continue; // Pula para o próximo
        }

        // 2. Obtém estatísticas do arquivo (substituto do statSync)
        const fileStats = await stat(att.localPath);
        const fileSize = fileStats.size;

        // 3. Lê metadados da imagem com Sharp
        // Sharp aceita string (caminho) nativamente e é assíncrono
        const metadata = await sharp(att.localPath).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        // 4. Atualiza o banco
        await this.prisma.attachment.update({
          where: { id: att.id },
          data: {
            sizeInBytes: fileSize,
            width: width,
            height: height
          }
        });

        updatedCount++;

        if (updatedCount % 50 === 0) {
          this.logger.log(
            `Processados e atualizados ${updatedCount} registros...`
          );
        }
      } catch (error) {
        this.logger.error(
          `Erro ao processar anexo ID ${att.id}: ${error.message}`,
          error.stack
        );
      }
    }

    const finalMessage = `Processo finalizado. Total de registros atualizados: ${updatedCount}.`;
    this.logger.log(finalMessage);

    return { success: true, message: finalMessage, updatedCount };
  }
}
