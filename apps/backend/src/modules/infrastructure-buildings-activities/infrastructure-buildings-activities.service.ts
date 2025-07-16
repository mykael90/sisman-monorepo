import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateInfrastructureBuildingActivityDto,
  UpdateInfrastructureBuildingActivityDto
} from './dto/infrastructure-building-activity.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class InfrastructureBuildingsActivitiesService {
  private readonly logger = new Logger(
    InfrastructureBuildingsActivitiesService.name
  );
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInfrastructureBuildingActivityDto) {
    try {
      const activity = await this.prisma.infrastructureBuildingActivity.create({
        data
      });
      return activity;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureBuildingsActivitiesService',
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
      const activities =
        await this.prisma.infrastructureBuildingActivity.findMany();
      return activities;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureBuildingsActivitiesService',
        {
          operation: 'list'
        }
      );
      throw error;
    }
  }

  show(id: number) {
    try {
      const activity = this.prisma.infrastructureBuildingActivity.findUnique({
        where: {
          id
        }
      });
      return activity;
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureBuildingsActivitiesService',
        {
          operation: 'show',
          id
        }
      );
      throw error;
    }
  }

  async update(id: number, data: UpdateInfrastructureBuildingActivityDto) {
    try {
      const updated = await this.prisma.infrastructureBuildingActivity.update({
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
        'InfrastructureBuildingsActivitiesService',
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
      const deleted = await this.prisma.infrastructureBuildingActivity.delete({
        where: {
          id
        }
      });
      return { message: 'Activity deleted successfully', deleted };
    } catch (error) {
      handlePrismaError(
        error,
        this.logger,
        'InfrastructureBuildingsActivitiesService',
        {
          operation: 'delete',
          id
        }
      );
      throw error;
    }
  }
}
