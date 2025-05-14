import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from 'src/shared/dto/user/create-user.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UpdatePutUserDTO } from 'src/shared/dto/user/update-put-user.dto';
import { UpdatePatchUserDTO } from 'src/shared/dto/user/update-patch-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateUserDTO) {
    // data.password = await this.hashPassword(data.password);

    if (await this.existsEmail(data.email) || await this.existsLogin(data.login)) {
      throw new BadRequestException(`E-mail or login already in use!`);
    }

    return await this.prisma.user.create({
      data,
      // select: {
      //   id: true,
      //   name: true,
      // },
    });
  }

  async list() {
    return await this.prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            userRoletype: {
              select: {
                role: true, 
                description: true,
              }
            }
          }
        },
      },
    });
  }
  async show(id: number) {
    await this.exists(id);
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          select: {
            userRoletypeId: true,
          },
        },
      },
    });
    return user;
  }

  async update(id: number, data: UpdatePutUserDTO) {
    3;
    await this.exists(id);
    // data.password = await this.hashPassword(data.password);
    return await this.prisma.user.update({ where: { id }, data });
  }

  async updatePartial(id: number, data: UpdatePatchUserDTO) {
    await this.exists(id);
    // if (data.password) data.password = await this.hashPassword(data.password);
    return await this.prisma.user.update({ where: { id }, data });
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
    async existsLogin(login: string) {
      const user = await this.prisma.user.findFirst({ where: { login } });
      return !!user;
    }

  // async hashPassword(password: string) {
  //   const salt = await bcrypt.genSalt();
  //   return await bcrypt.hash(password, salt);
  // }
}
