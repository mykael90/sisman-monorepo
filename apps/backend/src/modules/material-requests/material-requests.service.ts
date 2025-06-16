import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateMaterialRequestDto,
  UpdateMaterialRequestDto
} from './dto/material-request.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class MaterialRequestsService {
  private readonly logger = new Logger(MaterialRequestsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMaterialRequestDto) {
    try {
      const materialRequest = await this.prisma.materialRequest.create({
        data
      });
      return materialRequest;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list() {
    try {
      const materialRequests = await this.prisma.materialRequest.findMany();
      return materialRequests;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async show(id: number) {
    try {
      const materialRequest = await this.prisma.materialRequest.findUnique({
        where: {
          id
        }
      });
      return materialRequest;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  async update(id: number, data: UpdateMaterialRequestDto) {
    try {
      const updated = await this.prisma.materialRequest.update({
        where: {
          id
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.prisma.materialRequest.delete({
        where: {
          id
        }
      });
      return { message: 'Material request deleted successfully', deleted };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialRequestsService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }
}
