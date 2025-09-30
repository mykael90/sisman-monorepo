import { z } from 'zod';

export const workerSpecialtyFormSchemaAdd = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.'
  }),
  description: z.string().optional()
});

export const workerSpecialtyFormSchemaEdit = workerSpecialtyFormSchemaAdd.extend({
  id: z.coerce.number().positive('ID inválido')
});
