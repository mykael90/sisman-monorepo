import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/roles/role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRoleDto) {
    // Returns the provided 'data' parameter
    return data;
  }

  async list() {
    // No parameters provided, so returning undefined
    return undefined;
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
