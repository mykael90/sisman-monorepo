import { User, UserRole, UserRoletype, Prisma } from '@sisman/prisma';
import { use } from 'react';

// Defina o tipo para um usuário COM seus papéis (se papéis fossem um modelo relacionado)
// Este exemplo assume que 'roles' é o nome da relação no seu modelo User
// e que cada 'role' tem um campo 'name' do tipo PrismaUserRoleEnum.
export type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    userRoles: {
      // Supondo que a relação se chama 'roles' e aponta para um modelo 'Role'
      select: {
        // O que você quer selecionar do modelo 'Role'
        userRoletypeId: true;
      };
    };
  };
}>;

export interface IUserWithRoles extends Partial<User> {
  userRoles?: Partial<UserRole>[];
}

const user: IUserWithRoles = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'John Doe',
  userRoles: [
    {
      userId: 1
    }
  ]
};

export type UserWithSelectedFieldsAndRoles = Prisma.UserGetPayload<{
  select: {
    // Seleciona explicitamente os campos do User
    id: true;
    name: true;
    login: true;
    email: true;
    image: true;
    isActive: true;
    // Não estamos selecionando createdAt, updatedAt, ou LogLogin aqui
    userRoles: {
      // Inclui a relação userRoles
      select: {
        userRoletypeId: true;
      };
    };
  };
}>;

//Partial para deixar opcional
export type UserWithAll = Partial<
  Prisma.UserGetPayload<{
    include: {
      logLogin: true;
      userRoles: true;
    };
  }>
>;

// Se UserRole fosse um modelo e não um enum, e a relação fosse userRoles:
// type UserWithActualRoles = Prisma.UserGetPayload<{
//   include: {
//     userRoles: true; // Inclui todos os campos do modelo UserRole relacionado
//   }
// }>;

// Tipo para representar os detalhes de um UserRoletype que queremos expor
type RoleDetails = Pick<UserRoletype, 'id' | 'role' | 'description'>;
// Você pode adicionar mais campos de UserRoletype se precisar, como createdAt, updatedAt

// Tipo para representar uma entrada na lista de papéis do usuário,
// contendo o userRoletypeId da tabela de junção e os detalhes do UserRoletype
interface UserAssignedRole {
  userId: UserRole['userId']; // Ou simplesmente number
  userRoletypeId: UserRole['userRoletypeId']; // Ou simplesmente number
  // Em vez de ter o objeto UserRoletype completo da relação,
  // nós o "achatamos" ou selecionamos os campos que queremos.
  roleDetails: RoleDetails;
  // Se a sua tabela de junção UserRole tivesse outros campos próprios (ex: assignedAt),
  // você os adicionaria aqui. No seu schema, ela só tem as FKs.
}

// Esta estrutura é mais parecida com o que um 'include' faria.
// É um objeto UserRole (da tabela de junção) onde a propriedade userRoletype
// é preenchida com os detalhes que queremos de UserRoletype.
type PopulatedUserRoleEntry = Omit<
  UserRole,
  'user' | 'userRoletype' /* campos de relação */
> & {
  // user e userRoletype são omitidos porque eram tipos de relação não populados.
  // Aqui, substituímos userRoletype por uma versão populada ou com campos selecionados.
  userRoletype: RoleDetails; // Ou Pick<UserRoletype, 'id' | 'role' | 'description'>
};
