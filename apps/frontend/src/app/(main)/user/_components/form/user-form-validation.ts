import { z } from 'zod';
import { IActionResultForm } from '@/types/types-server-actions';

// Schema Zod (adapte conforme sua necessidade)
const userFormSchemaAdd = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  // a string de login deve ter obrigatoriamente um ponto dividindo 2 nomes

  // eu quero inserir essas 2 restriçÕes para login
  login: z
    .string()
    .regex(/\./, 'Login must contain a dot (.)')
    .min(3, 'Login must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  roles: z
    .array(
      z.object({
        id: z.number().min(1, 'Role ID cannot be empty.')
      })
    )
    .min(0, 'roles can be empty')
  // avatarUrl: z
  //   .string()
  //   .url('Invalid URL for avatar')
  //   .optional()
  //   .or(z.literal(''))
});

const userFormSchemaEdit = userFormSchemaAdd.extend({
  id: z.coerce.number(),
  isActive: z.boolean()
});

export type UserFormSchemaAdd = z.infer<typeof userFormSchemaAdd>;
export type UserFormSchemaEdit = z.infer<typeof userFormSchemaEdit>;
export { userFormSchemaAdd, userFormSchemaEdit };
