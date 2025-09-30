import { z } from 'zod';

export const workerFormSchemaAdd = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  email: z
    // 1. Usar .preprocess para tratar a string vazia
    .preprocess(
      (val) => {
        // Se o valor for uma string vazia, transforma em null.
        // O 'val' aqui será o que você recebe do input (geralmente string ou undefined).
        if (typeof val === 'string' && val.trim() === '') {
          return null;
        }
        return val;
      },
      // 2. Definir o esquema real que espera uma string OU null
      z
        .string()
        .email('Email inválido')
        // 3. Tornar opcional (permitindo undefined) e null (permitindo o valor que pre-processamos)
        .nullable() // Permite 'null'
        .optional() // Permite 'undefined'
    ),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  birthdate: z
    .string()
    .regex(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      'Data de nascimento deve estar no formato dd/MM/yyyy'
    )
    .min(1, 'Data de nascimento é obrigatória')
});

export const workerFormSchemaEdit = z.object({
  id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  birthdate: z
    .string()
    .regex(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      'Data de nascimento deve estar no formato dd/MM/yyyy'
    )
    .min(1, 'Data de nascimento é obrigatória')
});

export type WorkerFormSchemaAdd = z.infer<typeof workerFormSchemaAdd>;
export type workerFormSchemaEdit = z.infer<typeof workerFormSchemaEdit>;
