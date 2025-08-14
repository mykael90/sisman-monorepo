import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../shared/prisma/prisma.module';
import {
  CreateMaterialStockMovementTypeDto,
  UpdateMaterialStockMovementTypeDto
} from './dto/material-stock-movement-type.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class MaterialStockMovementTypesService {
  private readonly logger = new Logger(MaterialStockMovementTypesService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: CreateMaterialStockMovementTypeDto) {
    try {
      const materialStockMovementType =
        await this.prisma.materialStockMovementType.create({
          data
        });
      return materialStockMovementType;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'MaterialStockMovementTypesService',
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
      const materialStockMovementTypes =
        await this.prisma.materialStockMovementType.findMany();
      return materialStockMovementTypes;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'MaterialStockMovementTypesService',
        {
          operation: 'list'
        }
      );
      throw error;
    }
  }

  show(id: number) {
    try {
      const materialStockMovementType =
        this.prisma.materialStockMovementType.findUnique({
          where: {
            id
          }
        });
      return materialStockMovementType;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'MaterialStockMovementTypesService',
        {
          operation: 'show',
          id
        }
      );
      throw error;
    }
  }

  async update(id: number, data: UpdateMaterialStockMovementTypeDto) {
    try {
      const updated = await this.prisma.materialStockMovementType.update({
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
        'MaterialStockMovementTypesService',
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
      const deleted = await this.prisma.materialStockMovementType.delete({
        where: {
          id
        }
      });
      return {
        message: 'MaterialStockMovementType deleted successfully',
        deleted
      };
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'MaterialStockMovementTypesService',
        {
          operation: 'delete',
          id
        }
      );
      throw error;
    }
  }
}
