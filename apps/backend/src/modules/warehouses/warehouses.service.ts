import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class WarehousesService {
  private readonly logger = new Logger(WarehousesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWarehouseDto) {
    try {
      const warehouse = await this.prisma.warehouse.create({
        data
      });
      return warehouse;
    } catch (error) {
      handlePrismaError(error, this.logger, 'WarehousesService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list() {
    try {
      const warehouses = await this.prisma.warehouse.findMany();
      return warehouses;
    } catch (error) {
      handlePrismaError(error, this.logger, 'WarehousesService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async show(id: number) {
    try {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: {
          id
        }
      });
      return warehouse;
    } catch (error) {
      handlePrismaError(error, this.logger, 'WarehousesService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  async update(id: number, data: UpdateWarehouseDto) {
    try {
      const updated = await this.prisma.warehouse.update({
        where: {
          id
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'WarehousesService', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.prisma.warehouse.delete({
        where: {
          id
        }
      });
      return { message: 'Warehouse deleted successfully', deleted };
    } catch (error) {
      handlePrismaError(error, this.logger, 'WarehousesService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }
}
