import { Role, Prisma } from '@sisman/prisma';

// Interface para listar roles
export type IRoleList = Pick<Role, 'id' | 'role' | 'description' | 'updatedAt'>;

// Interface para dados completos de uma role (pode ser igual a Role)
export type IRole = Role;

// Interface para adicionar uma nova role
// Omitimos 'id' e campos gerenciados pelo Prisma como 'createdAt', 'updatedAt'
export type IRoleAdd = Omit<
  Prisma.RoleCreateInput,
  'users' // Se RoleCreateInput incluir relações, omita-as se não forem definidas no formulário de criação de Role
>; // Geralmente 'role' e 'description'

// Interface para editar uma role
// Inclui 'id' e os campos que podem ser editados
export type IRoleEdit = Prisma.RoleUpdateInput & { id: number }; // Garante que 'id' está presente e os campos são os de update
// Geralmente 'role', 'description' e o 'id'
