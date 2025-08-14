import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../shared/prisma/prisma.module';
import {
  CreateMaintenanceInstanceDto,
  UpdateMaintenanceInstance
} from './dto/maintenance-instance.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class MaintenanceInstancesService {
  private readonly logger = new Logger(MaintenanceInstancesService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: CreateMaintenanceInstanceDto) {
    try {
      const maintenanceInstance = await this.prisma.maintenanceInstance.create({
        data
      });
      return maintenanceInstance;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceInstancesService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list() {
    try {
      const maintenanceInstances =
        await this.prisma.maintenanceInstance.findMany();
      return maintenanceInstances;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceInstancesService', {
        operation: 'list'
      });
      throw error;
    }
  }

  async show(id: number) {
    try {
      const maintenanceInstance =
        await this.prisma.maintenanceInstance.findUnique({
          where: {
            id
          }
        });
      return maintenanceInstance;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceInstancesService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  async update(id: number, data: UpdateMaintenanceInstance) {
    try {
      const updated = await this.prisma.maintenanceInstance.update({
        where: {
          id
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceInstancesService', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.prisma.maintenanceInstance.delete({
        where: {
          id
        }
      });
      return { message: 'Maintenance instance deleted successfully', deleted };
    } catch (error) {
      handlePrismaError(error, this.logger, 'MaintenanceInstancesService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }
}
