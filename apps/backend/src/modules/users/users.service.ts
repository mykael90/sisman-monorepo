import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UpdateUserWithRelationsDTO } from './dto/update-user-with-relations.dto';
import {
  ConnectByIdInput,
  CreateUserWithRelationsDTO
} from './dto/create-user-with-relations.dto';
import { Prisma, User } from '@sisman/prisma';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserWithRelationsDTO): Promise<User> {
    // 1. Definir quais chaves do DTO representam relações que usam 'connect'
    //    e esperam um array de { id: number }
    const relationConnectKeys: (keyof CreateUserWithRelationsDTO)[] = [
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
        const typedKey = key as keyof CreateUserWithRelationsDTO;
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
          const relationData = value as ConnectByIdInput[];
          const isValidRelationData = relationData.every(
            (item) =>
              typeof item === 'object' &&
              item !== null &&
              'id' in item &&
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
      this.handlePrismaError(error, data.login, data.email); // Abstraído para um método auxiliar
      throw error; // Se não for um erro Prisma conhecido, re-lance
    }
  }

  async update(
    userId: number,
    data: UpdateUserWithRelationsDTO
  ): Promise<User> {
    // 1. Definir quais chaves do DTO representam relações que devem ser gerenciadas com 'set'
    const relationSetKeys: (keyof UpdateUserWithRelationsDTO)[] = [
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
        const typedKey = key as keyof UpdateUserWithRelationsDTO;
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
          const relationDataToSet = value as ConnectByIdInput[]; // Reutilizando ConnectByIdInput

          // Validação: cada item deve ser um objeto com 'id' numérico
          // Esta validação se aplica mesmo se o array estiver vazio (passará)
          const isValidRelationData = relationDataToSet.every(
            (item) =>
              typeof item === 'object' &&
              item !== null &&
              'id' in item &&
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
      this.handlePrismaError(error, data.login, data.email, userId);
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

  // Método auxiliar para tratar erros Prisma (corrigido)
  private handlePrismaError(
    error: any,
    login?: string,
    email?: string,
    userId?: number
  ) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        let targetFields = 'campo único';
        if (error.meta?.target) {
          if (Array.isArray(error.meta.target)) {
            targetFields = (error.meta.target as string[]).join(', ');
          } else if (typeof error.meta.target === 'string') {
            targetFields = error.meta.target as string;
          }
        }
        const entityContext = userId
          ? `dados do usuário (login: ${login}, email: ${email})`
          : `novo usuário`;
        this.logger.error(
          `Erro de unicidade ao tentar salvar ${entityContext}: campo(s) '${targetFields}' já existe(m).`
        );
        throw new ConflictException(
          `Conflito: O(s) campo(s) '${targetFields}' já está(ão) em uso.`
        );
      } else if (error.code === 'P2025') {
        let message =
          'Erro: Um ou mais registros necessários para a operação não foram encontrados.';
        let isRecordToUpdateNotFound = false;

        // Verifica se a causa do erro é o registro principal não encontrado
        const cause = (error.meta?.cause as string)?.toLowerCase();
        if (
          cause?.includes('record to update not found') ||
          error.message.toLowerCase().includes('record to update not found')
        ) {
          isRecordToUpdateNotFound = true;
        }

        if (isRecordToUpdateNotFound) {
          message = `Usuário com ID ${userId} não encontrado para atualização.`;
          this.logger.error(message, { meta: error.meta, userId });
          throw new NotFoundException(message);
        } else {
          // Erro P2025 devido a um ID inválido em `set: [...]` ou outra falha de dependência
          message = `Erro ao definir relações ou dependência não encontrada.`;
          this.logger.error(
            `${message} Verifique os IDs das relações fornecidas ou outras dependências.`,
            { meta: error.meta, userId } // Removida a referência a prismaUpdateInput
          );
          throw new BadRequestException(
            `${message} Verifique os IDs das relações fornecidas ou outras dependências.`
          );
        }
      }
    }
    // Não re-lançar o erro aqui, pois ele já é lançado no catch do método chamador (update/create)
    // Isso evita que o erro seja encapsulado duas vezes ou que a propagação seja interrompida prematuramente
    // se o método chamador tiver um `finally` ou outro tratamento.
  }
}
