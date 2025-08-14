import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../shared/prisma/prisma.module';
import {
  CreateInfrastructureFacilityComplexDto,
  UpdateInfrastructureFacilityComplexDto
} from './dto/infrastructure-facility-complex.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class InfrastructureFacilitiesComplexesService {
  private readonly logger = new Logger(
    InfrastructureFacilitiesComplexesService.name
  );
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

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
