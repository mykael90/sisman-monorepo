import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  PrismaService,
  ExtendedPrismaClient
} from '../../shared/prisma/prisma.module';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: ExtendedPrismaClient
  ) {}

  async create(data: CreateRoleDto) {
    try {
      const role = await this.prisma.role.create({
        data
      });
      return role;
    } catch (error) {
      handlePrismaError(error, this.logger, 'RolesService', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async list() {
    try {
      const roles = await this.prisma.role.findMany();
      return roles;
    } catch (error) {
      handlePrismaError(error, this.logger, 'RolesService', {
        operation: 'list'
      });
      throw error;
    }
  }

  show(id: number) {
    try {
      const role = this.prisma.role.findUnique({
        where: {
          id
        }
      });
      return role;
    } catch (error) {
      handlePrismaError(error, this.logger, 'RolesService', {
        operation: 'show',
        id
      });
      throw error;
    }
  }

  async update(id: number, data: UpdateRoleDto) {
    try {
      const updated = await this.prisma.role.update({
        where: {
          id
        },
        data
      });
      return updated;
    } catch (error) {
      handlePrismaError(error, this.logger, 'RolesService', {
        operation: 'update',
        id,
        data
      });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.prisma.role.delete({
        where: {
          id
        }
      });
      return { message: 'Role deleted successfully', deleted };
    } catch (error) {
      handlePrismaError(error, this.logger, 'RolesService', {
        operation: 'delete',
        id
      });
      throw error;
    }
  }
}
