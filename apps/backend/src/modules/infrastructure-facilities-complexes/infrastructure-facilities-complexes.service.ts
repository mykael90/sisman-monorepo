import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateInfrastructureFacilityComplexDto,
  UpdateInfrastructureFacilityComplexDto
} from '@sisman/types';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class InfrastructureFacilitiesComplexesService {
  private readonly logger = new Logger(
    InfrastructureFacilitiesComplexesService.name
  );
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInfrastructureFacilityComplexDto) {
    try {
      const infrastructureFacilityComplex =
        await this.prisma.infrastructureFacilityComplex.create({
          data
        });
      return infrastructureFacilityComplex;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureFacilitiesComplexesService',
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
      const infrastructureFacilitiesComplexes =
        await this.prisma.infrastructureFacilityComplex.findMany();
      return infrastructureFacilitiesComplexes;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureFacilitiesComplexesService',
        {
          operation: 'list'
        }
      );
      throw error;
    }
  }

  show(id: string) {
    try {
      const infrastructureFacilityComplex =
        this.prisma.infrastructureFacilityComplex.findUnique({
          where: {
            id
          }
        });
      return infrastructureFacilityComplex;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureFacilitiesComplexesService',
        {
          operation: 'show',
          id
        }
      );
      throw error;
    }
  }

  async update(id: string, data: UpdateInfrastructureFacilityComplexDto) {
    try {
      const updated = await this.prisma.infrastructureFacilityComplex.update({
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
        'InfrastructureFacilitiesComplexesService',
        {
          operation: 'update',
          id,
          data
        }
      );
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.prisma.infrastructureFacilityComplex.delete({
        where: {
          id
        }
      });
      return {
        message: 'InfrastructureFacilityComplex deleted successfully',
        deleted
      };
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureFacilitiesComplexesService',
        {
          operation: 'delete',
          id
        }
      );
      throw error;
    }
  }
}
