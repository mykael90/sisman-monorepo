import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateInfrastructureSpaceTypeDto,
  UpdateInfrastructureSpaceTypeDto
} from '@sisman/types';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class InfrastructureSpaceTypesService {
  private readonly logger = new Logger(InfrastructureSpaceTypesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInfrastructureSpaceTypeDto) {
    try {
      const infrastructureSpaceType =
        await this.prisma.infrastructureSpaceType.create({
          data
        });
      return infrastructureSpaceType;
    } catch (error) {
      handlePrismaError(error, this.logger, 'InfrastructureSpaceTypesService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list() {
    try {
      const infrastructureSpaceTypes =
        await this.prisma.infrastructureSpaceType.findMany();
      return infrastructureSpaceTypes;
    } catch (error) {
      handlePrismaError(error, this.logger, 'InfrastructureSpaceTypesService', {
        operation: 'list'
      });
      throw error;
    }
  }

  show(id: number) {
    try {
      const infrastructureSpaceType =
        this.prisma.infrastructureSpaceType.findUnique({
          where: {
            id
          }
        });
      return infrastructureSpaceType;
    } catch (error) {
      handlePrismaError(error, this.logger, 'InfrastructureSpaceTypesService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  async update(id: number, data: UpdateInfrastructureSpaceTypeDto) {
    try {
      const updated = await this.prisma.infrastructureSpaceType.update({
        where: {
          id
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'InfrastructureSpaceTypesService', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.prisma.infrastructureSpaceType.delete({
        where: {
          id
        }
      });
      return {
        message: 'InfrastructureSpaceType deleted successfully',
        deleted
      };
    } catch (error) {
      handlePrismaError(error, this.logger, 'InfrastructureSpaceTypesService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }
}
