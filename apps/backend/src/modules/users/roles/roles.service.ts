import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateUserRoleDto } from '../dto/roles/create-user-role.dto';
import { DeleteUserRoleDto } from '../dto/roles/delete-user-role.dto';
import { UpdateUserRoleDto } from '../dto/roles/update-user-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserRoleDto) {
    // Returns the provided 'data' parameter
    return data;
  }

  async list() {
    // No parameters provided, so returning undefined
    return undefined;
  }

  async delete(data: DeleteUserRoleDto) {
    // Returns the provided 'data' parameter
    return data;
  }

  async update(data: UpdateUserRoleDto, newUserRoletypeId: number) {
    // Returns the provided parameters
    return { data, newUserRoletypeId };
  }

  async exists(userId: number, userRoletypeId: number) {
    // Returns the provided parameters
    return { userId, userRoletypeId };
  }
}
