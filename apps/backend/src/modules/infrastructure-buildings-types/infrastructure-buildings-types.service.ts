import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateInfrastructureBuildingTypeDto,
  UpdateInfrastructureBuildingTypeDto
} from './dto/infrastructure-building-type.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class InfrastructureBuildingTypesService {
  private readonly logger = new Logger(InfrastructureBuildingTypesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInfrastructureBuildingTypeDto) {
    try {
      const infrastructureBuildingType =
        await this.prisma.infrastructureBuildingType.create({
          data
        });
      return infrastructureBuildingType;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureBuildingTypesService',
        {
          operation: 'create',
          data
        }
      );
      throw error;
    }
  }

  async list() {
    try {
      const infrastructureBuildingTypes =
        await this.prisma.infrastructureBuildingType.findMany();
      return infrastructureBuildingTypes;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureBuildingTypesService',
        {
          operation: 'list'
        }
      );
      throw error;
    }
  }

  show(id: number) {
    try {
      const infrastructureBuildingType =
        this.prisma.infrastructureBuildingType.findUnique({
          where: {
            id
          }
        });
      return infrastructureBuildingType;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureBuildingTypesService',
        {
          operation: 'show',
          id
        }
      );
      throw error;
    }
  }

  async update(id: number, data: UpdateInfrastructureBuildingTypeDto) {
    try {
      const updated = await this.prisma.infrastructureBuildingType.update({
        where: {
          id
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureBuildingTypesService',
        {
          operation: 'update',
          id,
          data
        }
      );
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.prisma.infrastructureBuildingType.delete({
        where: {
          id
        }
      });
      return {
        message: 'Infrastructure building type deleted successfully',
        deleted
      };
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureBuildingTypesService',
        {
          operation: 'delete',
          id
        }
      );
      throw error;
    }
  }
}
