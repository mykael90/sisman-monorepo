import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma, User } from '@sisman/prisma';
import { handlePrismaError } from '../../shared/utils/prisma-error-handler';
import {
  CreateUserWithRelationsDto,
  UpdateUserWithRelationsDto
} from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations: Prisma.UserInclude = {
    roles: true,
    maintenanceInstance: true
  };

  async create(data: CreateUserWithRelationsDto): Promise<User> {
    this.logger.log(`Criando usuário com dados: ${JSON.stringify(data)}`);
    const { roles, maintenanceInstance, ...restOfData } = data;

    const prismaCreateInput: Prisma.UserCreateInput = {
      ...restOfData,
      roles: roles
        ? { connect: roles.map((role) => ({ id: role.id })) }
        : undefined,
      maintenanceInstance: maintenanceInstance
        ? { connect: { id: maintenanceInstance.id } }
        : undefined
    };

    try {
      return await this.prisma.user.create({
        data: prismaCreateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Usuário', {
        operation: 'create',
        data
      });
      throw error;
    }
  }

  async update(
    userId: number,
    data: UpdateUserWithRelationsDto
  ): Promise<User> {
    const { roles, maintenanceInstance, ...restOfData } = data;

    const prismaUpdateInput: Prisma.UserUpdateInput = {
      ...restOfData
    };

    if (roles) {
      prismaUpdateInput.roles = { set: roles.map((role) => ({ id: role.id })) };
    }

    if (maintenanceInstance) {
      prismaUpdateInput.maintenanceInstance = {
        connect: { id: maintenanceInstance.id }
      };
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: prismaUpdateInput,
        include: this.includeRelations
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Usuário', {
        operation: 'update',
        userId: userId,
        data: prismaUpdateInput
      });
      throw error;
    }
  }

  async list() {
    return await this.prisma.user.findMany({
      include: {
        roles: true
      }
    });
  }

  async show(id: number) {
    await this.exists(id);
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: true
      }
    });
    return user;
  }

  async delete(id: number) {
    await this.exists(id);
    return await this.prisma.user.delete({ where: { id } });
  }

  async exists(id: number) {
    if (!(await this.prisma.user.count({ where: { id } }))) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }

  async existsEmail(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    return !!user;
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findFirst({ where: { email } });
  }

  async existsLogin(login: string) {
    const user = await this.prisma.user.findFirst({ where: { login } });
    console.log('resposta' + !!user);
    console.log(user);
    return !!user;
  }

  // async hashPassword(password: string) {
  //   const salt = await bcrypt.genSalt();
  //   return await bcrypt.hash(password, salt);
  // }
}
