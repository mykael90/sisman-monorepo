import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateMaterialWarehouseStockDto,
  UpdateMaterialWarehouseStockDto
} from '@sisman/types';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class MaterialWarehouseStocksService {
  private readonly logger = new Logger(MaterialWarehouseStocksService.name);
  constructor(private readonly prisma: PrismaService) {}

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
        await this.prisma.materialWarehouseStock.findMany();
      return materialWarehouseStocks;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaterialWarehouseStocksService', {
        operation: 'list'
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
