import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from 'src/shared/prisma/prisma.module';
import { Prisma, Attachment } from '@sisman/prisma';
import { handlePrismaError } from '../utils/prisma-error-handler';
import { CreateAttachmentDto, UpdateAttachmentDto } from './dto/attachment.dto';
import { FilesService } from '../files/files.service';
import { rest } from 'lodash';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    private readonly fileService: FilesService,
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: CreateAttachmentDto, tx?: Prisma.TransactionClient) {
    try {
      const prisma = tx || this.prisma;

      const { file, ...restOfData } = data;

      if (!file) {
      }

      this.logger.log(`Criando anexo com dados: ${JSON.stringify(data)}`);

      //Camando fileService para persistir o arquivo localmente ou em serviço de armazenamento
      // não espere guardar (não use await)
      this.fileService.upload(data.file, data.localPath);

      const createAttachmentInput: Prisma.AttachmentUncheckedCreateInput = {
        fileExtension: file.originalname.split('.').pop() || '',
        fileType: file.mimetype,
        originalFileName: file.originalname,
        storedFileName: restOfData.storedFileName,
        sizeInBytes: file.size,
        relatedId: restOfData.relatedId || null,
        relatedModel: restOfData.relatedModel || null,
        ...restOfData
      };

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

    if (queryParams && !!Object.keys(queryParams).length) {
      const { relatedId, relatedModel, userId } = queryParams;
      if (relatedId) {
        whereArgs.relatedId = relatedId;
      }
      if (relatedModel) {
        whereArgs.relatedModel = relatedModel;
      }
      if (userId) {
        whereArgs.userId = Number(userId);
      }
    }

    return await this.prisma.attachment.findMany({
      where: whereArgs,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async show(id: string) {
    await this.exists(id);
    return await this.prisma.attachment.findUnique({
      where: { id }
    });
  }

  async delete(id: string) {
    await this.exists(id);
    return await this.prisma.attachment.delete({ where: { id } });
  }

  async exists(id: string) {
    if (!(await this.prisma.attachment.count({ where: { id } }))) {
      throw new NotFoundException(`Attachment ${id} not found`);
    }
  }
}
