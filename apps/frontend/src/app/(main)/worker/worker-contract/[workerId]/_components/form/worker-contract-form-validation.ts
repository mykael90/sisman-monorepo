import { z } from 'zod';

export const workerContractFormSchemaAdd = z.object({
  name: z
    .string()
    .min(2, {
      message: 'O nome deve ter pelo menos 2 caracteres.'
    })
    .transform((val) => {
      return val.toUpperCase();
    }),
  description: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return null;
      return val.toUpperCase();
    })
});

export const workerContractFormSchemaEdit = workerContractFormSchemaAdd.extend({
  id: z.coerce.number().positive('ID inválido')
});
