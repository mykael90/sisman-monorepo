import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { Prisma } from '@sisman/prisma';
import { handlePrismaError } from '../utils/prisma-error-handler';
import { UpdateAttachmentDto } from './dto/attachment.dto';
import { FilesService } from '../files/files.service';
import { join } from 'path';
import * as sharp from 'sharp';

// Constantes ajustadas para a regra da Maior/Menor dimensão
const MAX_LONG_EDGE = 1920; // A maior aresta não pode passar disso
const MAX_SHORT_EDGE = 1080; // A menor aresta não pode passar disso

interface CreateAttachmentParams {
  file: Express.Multer.File;
  userId: number;
  relatedId: string | number;
  relatedModel: string;
}

interface CreateManyAttachmentsParams extends Omit<
  CreateAttachmentParams,
  'file'
> {
  files: Express.Multer.File[];
}

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    private readonly fileService: FilesService,
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: CreateAttachmentParams, tx?: Prisma.TransactionClient) {
    try {
      const { file, userId, relatedId, relatedModel } = data;
      this.validateCreateInput(data);

      const prisma = tx || this.prisma;
      this.logger.log(`Criando anexo para ${relatedModel} ID: ${relatedId}`);

      const { fileName, localPath } = this.generateFilePaths(
        relatedModel,
        relatedId,
        file.originalname
      );

      const createAttachmentInput: Prisma.AttachmentUncheckedCreateInput = {
        userId,
        relatedId: String(relatedId),
        relatedModel: relatedModel,
        fileExtension: this.getFileExtension(file.originalname),
        fileType: file.mimetype,
        originalFileName: file.originalname,
        localPath: localPath,
        storedFileName: fileName,
        sizeInBytes: file.size
      };

      let fileBufferToUpload = file.buffer;

      // Processamento condicional de imagem
      if (this.isImage(file)) {
        const imageInfo = await this.processImageMetadataAndResize(file.buffer);

        createAttachmentInput.width = imageInfo.width;
        createAttachmentInput.height = imageInfo.height;
        createAttachmentInput.sizeInBytes = imageInfo.size;

        if (imageInfo.buffer) {
          fileBufferToUpload = imageInfo.buffer;
        }
      }

      // Upload Async (Fire & Forget com tratamento de erro)
      this.uploadFileAsync(file, localPath, fileBufferToUpload);

      return await (prisma.attachment.create as any)({
        data: createAttachmentInput
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Attachment', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async createMany(
    data: CreateManyAttachmentsParams,
    tx?: Prisma.TransactionClient
  ) {
    const { files, userId, relatedId, relatedModel } = data;

    if (!files || files.length === 0) {
      throw new BadRequestException(
        'Nenhum arquivo fornecido para upload em lote.'
      );
    }

    this.logger.log(
      `Iniciando upload em lote de ${files.length} arquivos para ${relatedModel}:${relatedId}`
    );

    // Mapeia cada arquivo para uma promessa de criação individual.
    // O Promise.all executa todos em paralelo, acelerando o processo.
    const promises = files.map((file) =>
      this.create(
        {
          file,
          userId,
          relatedId,
          relatedModel
        },
        tx
      )
    );

    try {
      return await Promise.all(promises);
    } catch (error) {
      // Se um falhar, o Promise.all rejeita imediatamente.
      // Dependendo da regra de negócio, poderíamos usar Promise.allSettled para não falhar tudo,
      // mas aqui mantemos o comportamento "fail-fast" padrão.
      this.logger.error('Erro no processamento em lote', error);
      throw error;
    }
  }

  async update(
    id: string,
    data: UpdateAttachmentDto,
    tx?: Prisma.TransactionClient
  ) {
    try {
      await this.exists(id);
      const prisma = tx || this.prisma;
      this.logger.log(`Atualizando anexo ${id}`);

      return await (prisma.attachment.update as any)({
        where: { id },
        data: data as Prisma.AttachmentUpdateInput
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Attachment', {
        operation: 'update',
        attachmentId: id,
        data
      });
      throw error;
    }
  }

  async list(queryParams?: { [key: string]: string }) {
    const whereArgs: Prisma.AttachmentWhereInput = {};

    if (queryParams) {
      const { relatedId, relatedModel, userId } = queryParams;
      if (relatedId) whereArgs.relatedId = relatedId;
      if (relatedModel) whereArgs.relatedModel = relatedModel;
      if (userId) whereArgs.userId = Number(userId);
    }

    return await this.prisma.attachment.findMany({
      where: whereArgs,
      orderBy: { createdAt: 'desc' }
    });
  }

  async show(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id }
    });
    if (!attachment) throw new NotFoundException(`Anexo ${id} não encontrado.`);
    return attachment;
  }

  async delete(id: string) {
    await this.exists(id);
    return await this.prisma.attachment.delete({ where: { id } });
  }

  async exists(id: string): Promise<void> {
    const count = await this.prisma.attachment.count({ where: { id } });
    if (count === 0) throw new NotFoundException(`Attachment ${id} not found`);
  }

  // ===========================================================================
  // MÉTODOS PRIVADOS
  // ===========================================================================

  private validateCreateInput(data: CreateAttachmentParams) {
    if (!data.file) throw new BadRequestException('Arquivo não fornecido.');
    if (!data.userId)
      throw new BadRequestException('ID do usuário não fornecido.');
    if (!data.relatedId || !data.relatedModel) {
      throw new BadRequestException('Dados de relacionamento incompletos.');
    }
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  private isImage(file: Express.Multer.File): boolean {
    return file.mimetype.startsWith('image/');
  }

  private generateFilePaths(
    relatedModel: string,
    relatedId: string | number,
    originalName: string
  ) {
    const baseStoragePath = join(
      process.cwd(),
      'storage',
      relatedModel.toLowerCase()
    );
    const randomFourNumber = Math.floor(1000 + Math.random() * 9000);
    const fileName = `${relatedModel}-${relatedId}-${Date.now()}-${randomFourNumber}.jpg`;

    return {
      fileName,
      localPath: join(baseStoragePath, fileName)
    };
  }

  private uploadFileAsync(
    file: Express.Multer.File,
    path: string,
    buffer: Buffer
  ) {
    const fileToUpload = { ...file, buffer };
    this.fileService.upload(fileToUpload, path).catch((err) => {
      this.logger.error(`Erro no upload background: ${err.message}`, err.stack);
    });
  }

  /**
   * Ajusta a imagem baseado nas regras:
   * - Maior dimensão <= 1920
   * - Menor dimensão <= 1080
   */
  private async processImageMetadataAndResize(buffer: Buffer) {
    try {
      const instance = sharp(buffer);
      const metadata = await instance.metadata();

      const width = metadata.width || 0;
      const height = metadata.height || 0;

      // Define se é Paisagem ou Retrato para aplicar os limites na ordem certa
      const isLandscape = width >= height;

      // Se Paisagem: Limite Largura=1920, Altura=1080
      // Se Retrato: Limite Largura=1080, Altura=1920
      const limitWidth = isLandscape ? MAX_LONG_EDGE : MAX_SHORT_EDGE;
      const limitHeight = isLandscape ? MAX_SHORT_EDGE : MAX_LONG_EDGE;

      // Verifica se alguma dimensão viola os limites
      const needsResize = width > limitWidth || height > limitHeight;

      let outputBuffer: Buffer | null = null;
      let finalSize = buffer.byteLength;
      let finalWidth = width;
      let finalHeight = height;

      if (needsResize) {
        this.logger.debug(
          `Redimensionando (${width}x${height}) para caber em (${limitWidth}x${limitHeight})`
        );

        // 'fit: inside' garante que a imagem caiba inteira dentro das dimensões especificadas
        // mantendo a proporção original.
        outputBuffer = await instance
          .resize(limitWidth, limitHeight, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .toBuffer();

        const newMetadata = await sharp(outputBuffer).metadata();
        finalWidth = newMetadata.width || 0;
        finalHeight = newMetadata.height || 0;
        finalSize = outputBuffer.byteLength;
      }

      return {
        buffer: outputBuffer,
        width: finalWidth,
        height: finalHeight,
        size: finalSize
      };
    } catch (error) {
      this.logger.error(
        `Falha ao processar imagem: ${error.message}`,
        error.stack
      );
      // Retorna valores padrão para não quebrar o fluxo, mas sem buffer alterado
      return { buffer: null, width: 0, height: 0, size: buffer.byteLength };
    }
  }
}
