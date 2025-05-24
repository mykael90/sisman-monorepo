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

  async create(data: CreateUserWithRelationsDto): Promise<User> {
    this.logger.log(`Criando usuário com dados: ${JSON.stringify(data)}`);
    // 1. Definir quais chaves do DTO representam relações que usam 'connect'
    //    e esperam um array de { id: number }
    const relationConnectKeys: (keyof CreateUserWithRelationsDto)[] = [
      'roles'
      // Adicione outras chaves de relação aqui
    ];

    // 2. Separar campos escalares dos relacionais e construir o input do Prisma
    const prismaCreateInput: Prisma.UserCreateInput =
      {} as Prisma.UserCreateInput;
    const relationsToInclude: Prisma.UserInclude = {};

    // Iterar sobre todas as chaves do DTO de entrada
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const typedKey = key as keyof CreateUserWithRelationsDto;
        const value = data[typedKey];

        if (value === undefined) {
          // Ignorar valores undefined
          continue;
        }

        // 2. Verificar se a chave é uma relação para conectar
        if (
          relationConnectKeys.includes(typedKey) &&
          Array.isArray(value) &&
          value.length > 0
        ) {
          // Validação adicional para garantir que os itens da relação têm 'id'
          const relationData = value;
          const isValidRelationData = relationData.every(
            (item) =>
              typeof item === 'object' &&
              item !== null &&
              'id' in item &&
              //TODO: verificar number or string
              typeof item.id === 'number'
          );

          if (!isValidRelationData) {
            throw new BadRequestException(
              `Formato inválido para a relação '${typedKey}'. Esperado um array de objetos com 'id'.`
            );
          }

          (prismaCreateInput as any)[typedKey] = {
            connect: relationData
          };
          (relationsToInclude as any)[typedKey] = true;

          // 3. Verificar se a chave é um campo escalar conhecido do modelo User
          // Usamos Prisma.UserScalarFieldEnum para obter a lista de campos escalares válidos.
          // Object.values() é usado porque UserScalarFieldEnum é um objeto enum-like.
        } else if (
          Object.values(Prisma.UserScalarFieldEnum).includes(
            typedKey as Prisma.UserScalarFieldEnum
          )
        ) {
          // É um campo escalar válido para o modelo User
          // (e não é uma das relationConnectKeys já tratadas)
          (prismaCreateInput as any)[typedKey] = value;
        }
        // Chaves no DTO que não são relações configuradas nem escalares do modelo User
        // serão ignoradas pelo Prisma se não corresponderem a um campo em UserCreateInput.
        // Se você quiser ser mais estrito, pode lançar um erro aqui.
      }
    }

    // Se o 'id' é autogerado e pode vir no DTO (o que não é ideal para create),
    // você pode querer removê-lo explicitamente do prismaCreateInput aqui:
    // delete (prismaCreateInput as any).id;
    // No entanto, o Object.values(Prisma.UserScalarFieldEnum) já o incluiria.
    // Uma abordagem melhor é garantir que seu DTO de criação não inclua 'id'.
    // Se o `id` estiver no DTO e for um campo escalar, ele será incluído.
    // Se você não quer que `id` seja definido na criação, certifique-se de que
    // `CreateUserWithRelationsDTO` não o tenha ou filtre `Prisma.UserScalarFieldEnum`.

    try {
      return await this.prisma.user.create({
        data: prismaCreateInput,
        include:
          Object.keys(relationsToInclude).length > 0
            ? relationsToInclude
            : undefined
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Usuário', {
        operation: 'create',
        data
      });
      throw error; // Se não for um erro Prisma conhecido, re-lance
    }
  }

  async update(
    userId: number,
    data: UpdateUserWithRelationsDto
  ): Promise<User> {
    // 1. Definir quais chaves do DTO representam relações que devem ser gerenciadas com 'set'
    const relationSetKeys: (keyof UpdateUserWithRelationsDto)[] = [
      'roles' // Esta relação agora será gerenciada com 'set'
      // 'photos',
      // 'groups',
      // Adicione outras chaves de relação que devem usar 'set'
    ];

    const prismaUpdateInput: Prisma.UserUpdateInput = {};
    const relationsToInclude: Prisma.UserInclude = {};
    let hasUpdates = false;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const typedKey = key as keyof UpdateUserWithRelationsDto;
        const value = data[typedKey];

        if (value === undefined) {
          // 'undefined' significa "não alterar este campo"
          continue;
        }
        hasUpdates = true;

        // 2. Verificar se a chave é uma relação para definir com 'set'
        if (
          relationSetKeys.includes(typedKey) &&
          Array.isArray(value) // 'value' deve ser um array (pode ser vazio para remover todas as conexões)
        ) {
          const relationDataToSet = value;

          // Validação: cada item deve ser um objeto com 'id' numérico
          // Esta validação se aplica mesmo se o array estiver vazio (passará)
          const isValidRelationData = relationDataToSet.every(
            (item) =>
              typeof item === 'object' &&
              item !== null &&
              'id' in item &&
              //TODO: number os string
              typeof item.id === 'number'
          );

          if (!isValidRelationData) {
            throw new BadRequestException(
              `Formato inválido para a relação '${typedKey}'. Esperado um array de objetos com 'id'.`
            );
          }

          // Usar 'set' para substituir completamente as conexões existentes
          (prismaUpdateInput as any)[typedKey] = {
            set: relationDataToSet // Ex: roles: { set: [{id:1}, {id:2}] } ou roles: { set: [] }
          };
          (relationsToInclude as any)[typedKey] = true;
        } else if (
          Object.values(Prisma.UserScalarFieldEnum).includes(
            typedKey as Prisma.UserScalarFieldEnum
          )
        ) {
          // É um campo escalar válido para o modelo User
          (prismaUpdateInput as any)[typedKey] = value;
        }
      }
    }

    if (!hasUpdates && Object.keys(prismaUpdateInput).length === 0) {
      // Verifica também se prismaUpdateInput está realmente vazio, caso todos os valores
      // fossem undefined, mas alguma chave de relação com array vazio tenha sido processada.
      this.logger.warn(
        `Nenhuma alteração fornecida para o usuário ID: ${userId}. Retornando dados existentes.`
      );
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
        // Inclui as relações que poderiam ter sido atualizadas, mesmo que não tenham sido
        include: relationSetKeys.reduce((acc, key) => {
          acc[key as string] = true;
          return acc;
        }, {} as Prisma.UserInclude)
      });
      if (!existingUser) {
        throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
      }
      return existingUser;
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: prismaUpdateInput,
        include:
          Object.keys(relationsToInclude).length > 0
            ? relationsToInclude
            : undefined
      });
    } catch (error) {
      handlePrismaError(error, this.logger, 'Usuário', {
        operation: 'update',
        userId: userId,
        data
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
