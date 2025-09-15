import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../shared/prisma/prisma.module';
import {
  CreateMaterialWarehouseStockDto,
  UpdateMaterialWarehouseStockDto
} from './dto/material-warehouse-stock.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class MaterialWarehouseStocksService {
  private readonly logger = new Logger(MaterialWarehouseStocksService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: CreateMaterialWarehouseStockDto) {
    try {
      const materialWarehouseStock =
        await this.prisma.materialWarehouseStock.create({
          data
        });
      return materialWarehouseStock;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWarehouseStocksService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list() {
    try {
      const materialWarehouseStocks =
        await this.prisma.materialWarehouseStock.findMany({
          include: {
            material: true,
            warehouse: true
          }
        });
      return materialWarehouseStocks;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWarehouseStocksService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async listByWarehouseId(warehouseId: number) {
    try {
      const materialWarehouseStocks =
        await this.prisma.materialWarehouseStock.findMany({
          where: {
            warehouseId
          },
          include: {
            material: true,
            warehouse: true
          },
          orderBy: {
            material: {
              name: 'asc'
            }
          }
        });
      return materialWarehouseStocks;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWarehouseStocksService', {
        operation: 'listByWarehouseId'
      });
      throw error;
    }
  }

  show(id: number) {
    try {
      const materialWarehouseStock =
        this.prisma.materialWarehouseStock.findUnique({
          where: {
            id
          }
        });
      return materialWarehouseStock;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWarehouseStocksService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  showByWarehouseAndMaterial(warehouseId: number, materialId: string) {
    try {
      const materialWarehouseStock =
        this.prisma.materialWarehouseStock.findUnique({
          where: {
            unique_warehouse_material_standard_stock: {
              warehouseId,
              materialId
            }
          }
        });
      return materialWarehouseStock;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWarehouseStocksService', {
        operation: 'show',
        warehouseId,
        materialId
      });
    }
  }

  async update(id: number, data: UpdateMaterialWarehouseStockDto) {
    try {
      const updated = await this.prisma.materialWarehouseStock.update({
        where: {
          id
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWarehouseStocksService', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async updateByMaterialIdAndWarehouseId(
    materialId: string,
    warehouseId: number,
    data: UpdateMaterialWarehouseStockDto
  ) {
    try {
      const updated = await this.prisma.materialWarehouseStock.update({
        where: {
          unique_warehouse_material_standard_stock: {
            materialId,
            warehouseId
          }
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWarehouseStocksService', {
        operation: 'updateByMaterialIdAndWarehouseId',
        materialId,
        warehouseId,
        data
      });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.prisma.materialWarehouseStock.delete({
        where: {
          id
        }
      });
      return {
        message: 'MaterialWarehouseStock deleted successfully',
        deleted
      };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWarehouseStocksService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }
}
