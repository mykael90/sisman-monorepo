import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateStorageDto, UpdateStorageDto } from './dto/storage.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class StoragesService {
  private readonly logger = new Logger(StoragesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStorageDto) {
    try {
      const storage = await this.prisma.storage.create({
        data
      });
      return storage;
    } catch (error) {
      handlePrismaError(error, this.logger, 'StoragesService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list() {
    try {
      const storages = await this.prisma.storage.findMany();
      return storages;
    } catch (error) {
      handlePrismaError(error, this.logger, 'StoragesService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async show(id: number) {
    try {
      const storage = await this.prisma.storage.findUnique({
        where: {
          id
        }
      });
      return storage;
    } catch (error) {
      handlePrismaError(error, this.logger, 'StoragesService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  async update(id: number, data: UpdateStorageDto) {
    try {
      const updated = await this.prisma.storage.update({
        where: {
          id
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'StoragesService', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.prisma.storage.delete({
        where: {
          id
        }
      });
      return { message: 'Storage deleted successfully', deleted };
    } catch (error) {
      handlePrismaError(error, this.logger, 'StoragesService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }
}
