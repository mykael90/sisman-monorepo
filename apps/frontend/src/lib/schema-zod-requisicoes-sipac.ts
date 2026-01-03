import { z } from 'zod';

export const schemaZodRequisicoesSipac = z.object({
  newReq: z
    .string()
    .min(1, 'Requerido')
    .regex(
      /^[0-9]{1,5}$|^[0-9]+[/]{1}[0-9]{4}$/,
      'Formato de requisição não permitido'
    )
    .transform((val) => {
      const currentYear = new Date().getFullYear();

      // Normaliza
      // const value = val.toUpperCase();

      // Se já vier com ano, mantém
      if (val.includes('/')) {
        return val;
      }

      // Caso contrário, adiciona o ano atual
      return `${val}/${currentYear}`;
    })
});
