import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateUserRoleDto } from '../../../shared/dto/user/role/create-user-role.dto';
import { DeleteUserRoleDto } from '../../../shared/dto/user/role/delete-user-role.dto';
import { UpdateUserRoleDto } from '../../../shared/dto/user/role/update-user-role.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserRoleDto) {
    // Verifica se o usuário e o tipo de role existem antes de criar a relação
    // (Opcional, mas recomendado para evitar erros de FK)
    const userExists = await this.prisma.user.count({
      where: { id: data.userId },
    });
    if (!userExists) {
      throw new NotFoundException(`User with ID ${data.userId} not found.`);
    }
    const roleTypeExists = await this.prisma.userRoletype.count({
      where: { id: data.userRoletypeId },
    });
    if (!roleTypeExists) {
      throw new NotFoundException(
        `Role type with ID ${data.userRoletypeId} not found.`,
      );
    }

    try {
      // Verifica se a relação já existe para evitar duplicatas (Constraint do BD pode já fazer isso)
      const existingRole = await this.prisma.userRole.findUnique({
        where: {
          userId_userRoletypeId: {
            userId: data.userId,
            userRoletypeId: data.userRoletypeId,
          },
        },
      });

      if (existingRole) {
        throw new BadRequestException('User already has this role.');
      }

      return await this.prisma.userRole.create({ data });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      // Logar o erro original pode ser útil aqui
      this.logger.error('Error creating user role:', error);
      throw new InternalServerErrorException(
        'Error creating user role. Please check logs.',
      );
    }
  }

  async list() {
    try {
      return await this.prisma.userRole.findMany({
        // Considerar adicionar `userId` se for útil no frontend
        select: {
          userId: true,
          userRoletypeId: true,
          // user: false, // 'include: { user: false }' não é uma sintaxe válida, use select
          userRoletype: {
            select: {
              role: true,
            },
          },
        },
      });
    } catch (error) {
      // Logar o erro original pode ser útil aqui
      this.logger.error('Error listing user roles:', error);
      throw new InternalServerErrorException('Error listing user roles');
    }
  }

  async delete(data: DeleteUserRoleDto) {
    const { userId, userRoletypeId } = data;
    // A verificação de existência já lança NotFoundException se não encontrar
    await this.exists(userId, userRoletypeId);
    try {
      // Correção: Usar o formato correto para a chave composta no 'where'
      return await this.prisma.userRole.delete({
        where: {
          userId_userRoletypeId: {
            userId,
            userRoletypeId,
          },
        },
      });
    } catch (error) {
      // Logar o erro original pode ser útil aqui
      this.logger.error('Error deleting user role:', error);
      throw new InternalServerErrorException('Error deleting user role.');
    }
  }

  async update(data: UpdateUserRoleDto, newUserRoletypeId: number) {
    const { userId, userRoletypeId } = data;
    // A verificação de existência já lança NotFoundException se não encontrar
    await this.exists(userId, userRoletypeId);

    // Opcional: Verificar se o novo role type existe
    const newRoleTypeExists = await this.prisma.userRoletype.count({
      where: { id: newUserRoletypeId },
    });
    if (!newRoleTypeExists) {
      throw new NotFoundException(
        `New Role type with ID ${newUserRoletypeId} not found.`,
      );
    }

    // Opcional: Verificar se o usuário já possui o novo role para evitar erro de constraint unique
    const alreadyHasNewRole = await this.prisma.userRole.count({
      where: { userId: userId, userRoletypeId: newUserRoletypeId },
    });
    if (alreadyHasNewRole > 0) {
      throw new BadRequestException(
        `User already has the role type ID ${newUserRoletypeId}.`,
      );
    }

    try {
      // Correção: Usar o formato correto para a chave composta no 'where'
      return await this.prisma.userRole.update({
        where: {
          userId_userRoletypeId: {
            userId,
            userRoletypeId,
          },
        },
        data: { userRoletypeId: newUserRoletypeId },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      // Logar o erro original pode ser útil aqui
      this.logger.error('Error updating user role:', error);
      throw new InternalServerErrorException('Error updating user role.');
    }
  }

  async exists(userId: number, userRoletypeId: number) {
    // O método count aceita o where mais simples, então está correto.
    // Alternativamente, poderia usar findUnique e verificar se o resultado é null.
    const count = await this.prisma.userRole.count({
      where: { userId, userRoletypeId },
    });
    if (count === 0) {
      throw new NotFoundException(
        `User role relationship not found for User ID ${userId} and Role Type ID ${userRoletypeId}`,
      );
    }
    // Não é necessário retornar nada aqui, a função serve para lançar erro ou passar.
  }
}
