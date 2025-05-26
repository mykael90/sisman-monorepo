import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/roles/role.dto';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRoleDto) {
    // Returns the provided 'data' parameter
    return data;
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
    throw new Error('Method not implemented.');
  }

  async update(id: number, data: UpdateRoleDto) {
    // Returns the provided parameters
    return { data, newUserRoletypeId: id };
  }

  async delete(data: { id: number }) {
    // Returns the provided 'data' parameter
    return data;
  }
}
