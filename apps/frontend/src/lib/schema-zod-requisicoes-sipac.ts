import { z } from 'zod';

export const schemaZodRequisicoesSipac = z.object({
  newReq: z.preprocess(
    (val) => {
      if (typeof val !== 'string') return val;

      const currentYear = new Date().getFullYear();

      if (val.includes('/')) {
        return val;
      }

      return `${val}/${currentYear}`;
    },
    z
      .string()
      .min(1, 'Requerido')
      .regex(/^[0-9]{1,5}\/[0-9]{4}$/, 'Formato de requisição não permitido')
  )
});
