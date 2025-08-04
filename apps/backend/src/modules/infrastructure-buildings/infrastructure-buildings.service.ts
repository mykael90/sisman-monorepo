import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateInfrastructureBuildingDto,
  UpdateInfrastructureBuildingDto
} from '@sisman/types/backend';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class InfrastructureBuildingsService {
  private readonly logger = new Logger(InfrastructureBuildingsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInfrastructureBuildingDto) {
    try {
      const infrastructureBuilding =
        await this.prisma.infrastructureBuilding.create({
          data
        });
      return infrastructureBuilding;
    } catch (error) {
      handlePrismaError(error, this.logger, 'InfrastructureBuildingsService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list() {
    try {
      const infrastructureBuildings =
        await this.prisma.infrastructureBuilding.findMany();
      return infrastructureBuildings;
    } catch (error) {
      handlePrismaError(error, this.logger, 'InfrastructureBuildingsService', {
        operation: 'list'
      });
      throw error;
    }
  }

  show(id: string) {
    try {
      const infrastructureBuilding =
        this.prisma.infrastructureBuilding.findUnique({
          where: {
            id
          }
        });
      return infrastructureBuilding;
    } catch (error) {
      handlePrismaError(error, this.logger, 'InfrastructureBuildingsService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  async update(id: string, data: UpdateInfrastructureBuildingDto) {
    try {
      const updated = await this.prisma.infrastructureBuilding.update({
        where: {
          id
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'InfrastructureBuildingsService', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.prisma.infrastructureBuilding.delete({
        where: {
          id
        }
      });
      return {
        message: 'InfrastructureBuilding deleted successfully',
        deleted
      };
    } catch (error) {
      handlePrismaError(error, this.logger, 'InfrastructureBuildingsService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }
}
