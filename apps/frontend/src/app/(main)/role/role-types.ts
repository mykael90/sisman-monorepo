import { Role, Prisma } from '@sisman/prisma';

// Interface para dados completos de uma role (pode ser igual a Role)
export type IRole = Role;

// Interface para adicionar uma nova role
// Omitimos 'id' e campos gerenciados pelo Prisma como 'createdAt', 'updatedAt'
export interface IRoleAdd extends Prisma.RoleCreateManyInput {}

// Interface para editar uma role
// Inclui 'id' e os campos que podem ser editados
export interface IRoleEdit extends IRoleAdd {} // Garante que 'id' está presente e os campos são os de update
// Geralmente 'role', 'description' e o 'id'
