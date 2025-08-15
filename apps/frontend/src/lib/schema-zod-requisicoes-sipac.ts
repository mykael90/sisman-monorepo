import { z } from 'zod';

export const schemaZodRequisicoesSipac = z.object({
  newReq: z
    .string()
    .min(1, 'Requerido')
    .regex(
      /^[0-9]{1,5}$|^[0-9]+[/]{1}[0-9]{4}$/,
      'Formato de requisição não permitido'
    )
});
