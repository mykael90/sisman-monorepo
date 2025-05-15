import { User, UserRole, UserRoletype, Prisma } from '@sisman/prisma';

const dateFields = ['createdAt', 'updatedAt'];

export interface IUserList extends Omit<User, 'createdAt' | 'updatedAt'> {}

export interface IUserAdd
  extends Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'image' | 'isActive'> {}

export interface IUserEdit
  extends Omit<User, 'createdAt' | 'updatedAt' | 'image' | 'isActive'> {}

export interface IUserRemove extends Pick<User, 'id'> {}

export interface IUserListWithRoles extends IUserList {
  userRoles: UserRole[];
}

export type TUserList = Partial<
  Prisma.UserGetPayload<{
    // select: {
    //   name: true;
    //   login: true;
    //   email: true;
    //   image: true;
    //   isActive: true;
    // };
    include: {
      userRoles: {
        // Supondo que a relação se chama 'roles' e aponta para um modelo 'Role'
        select: {
          // O que você quer selecionar do modelo 'Role'
          userRoletypeId: true;
        };
      };
    };
    omit: {
      id: true;
      createdAt: true;
      updatedAt: true;
    };
  }>
>;

//Usando métodos direto do prisma, pode ser mais custoso em termos de memória.
// export type UserWithSelectedFieldsAndRoles = Prisma.UserGetPayload<{
//   select: {
//     // Seleciona explicitamente os campos do User
//     id: true;
//     name: true;
//     login: true;
//     email: true;
//     image: true;
//     isActive: true;
//     // Não estamos selecionando createdAt, updatedAt, ou LogLogin aqui
//     userRoles: {
//       // Inclui a relação userRoles
//       select: {
//         userRoletypeId: true;
//       };
//     };
//   };
//   omit: {
//     createdAt: true;
//     updatedAt: true;
//     logLogin: true;
//   };
// }>;

const user: IUserList = {};
