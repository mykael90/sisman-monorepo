import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { join } from 'path';
import { createReadStream } from 'fs';

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
}
