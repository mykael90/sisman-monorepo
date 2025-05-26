import { User, UserRole, UserRoletype, Prisma } from '@sisman/prisma';
import { IRole, IRoleAdd } from '../role/role-types';

const dateFields = ['createdAt', 'updatedAt'];

// export interface IUserList
//   extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {}

// export interface IUserAdd
//   extends Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'image' | 'isActive'> {}

// export interface IUserEdit
//   extends Omit<User, 'createdAt' | 'updatedAt' | 'image' | 'isActive'> {}

// export interface IUserRemove extends Pick<User, 'id'> {}

// export interface IUserListWithRoles extends IUserList {
//   userRoles: UserRole[];
// }

export type IUserList = Prisma.UserGetPayload<{
  // select: {
  //   name: true;
  //   login: true;
  //   email: true;
  //   image: true;
  //   isActive: true;
  // };
  include: {
    roles: true;
  };
  // omit: {
  //   id: true;
  //   createdAt: true;
  //   updatedAt: true;
  // };
}>;

// export type IUserAdd = Prisma.UserCreateInput;

export interface IUserAdd extends Prisma.UserCreateManyInput {
  roles: Record<'id', any>[];
}

export interface IUserEdit extends IUserAdd {
  id: number;
}

export type IUser = User;

// export type IUserEdit = Prisma.UserUncheckedUpdateInput;

export type IUserRemove = {
  id: string;
};

export type IUserSelect = Prisma.UserSelect;
