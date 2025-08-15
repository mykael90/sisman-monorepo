import { z } from 'zod';
import { IActionResultForm } from '@/types/types-server-actions';
import { IRoleAdd, IRoleEdit } from '../../role-types';

// Schema Zod para adicionar Role
export const roleFormSchemaAdd = z.object({
  id: z.coerce.number(),
  role: z
    .string()
    .min(3, 'O nome do papel deve ter pelo menos 3 caracteres')
    .regex(
      /^[A-Z_]+$/,
      'O nome do papel deve conter apenas letras maiúsculas e underscores (ex: ADMIN_USER)'
    ),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
});

// Schema Zod para editar Role (geralmente inclui o ID e os mesmos campos)
export const roleFormSchemaEdit = roleFormSchemaAdd.extend({
  id: z.coerce.number().positive('ID inválido')
});
