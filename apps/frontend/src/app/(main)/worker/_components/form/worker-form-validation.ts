import { z } from 'zod';
import { zodVerifyCPF } from '../../../../../lib/form-utils';

// Esquema com .passthrough() (vai manter chaves extras)

export const workerFormSchemaAdd = z
  .object({
    name: z
      .string()
      .min(1, 'Nome é obrigatório')
      .transform((val) => {
        return val.toUpperCase();
      }),
    cpf: z
      .string()
      .min(1, 'CPF é obrigatório')
      .transform((val) => val.replace(/[^\d]/g, ''))
      .refine((val) => val.length === 11, {
        message: 'CPF deve ter 11 dígitos'
      })
      .refine((val) => zodVerifyCPF(val), {
        message: 'CPF inválido'
      }),
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
    phone: z
      .string()
      .min(1, 'Telefone é obrigatório')
      .transform((val) => val.replace(/[^\d]/g, ''))
      .refine((val) => val.length >= 10 && val.length <= 11, {
        message: 'Telefone deve ter 10 ou 11 dígitos'
      }),
    birthdate: z
      .string()
      .regex(
        /^(\d{2})\/(\d{2})\/(\d{4})$/,
        'Data de nascimento deve estar no formato dd/MM/yyyy'
      )
      .min(1, 'Data de nascimento é obrigatória')
    // maintenanceInstanceId: z.number().optional().nullable()
  })
  .passthrough();

export const workerFormSchemaEdit = z.object({
  id: z.number(),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .transform((val) => val.toUpperCase()),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .transform((val) => val.replace(/[^\d]/g, ''))
    .refine((val) => val.length === 11, {
      message: 'CPF deve ter 11 dígitos'
    })
    .refine((val) => zodVerifyCPF(val), {
      message: 'CPF inválido'
    }),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .transform((val) => val.replace(/[^\d]/g, ''))
    .refine((val) => val.length >= 10 && val.length <= 11, {
      message: 'Telefone deve ter 10 ou 11 dígitos'
    }),
  birthdate: z
    .string()
    .regex(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      'Data de nascimento deve estar no formato dd/MM/yyyy'
    )
    .min(1, 'Data de nascimento é obrigatória'),
  maintenanceInstanceId: z.number().optional().nullable()
});

export type WorkerFormSchemaAdd = z.infer<typeof workerFormSchemaAdd>;
export type workerFormSchemaEdit = z.infer<typeof workerFormSchemaEdit>;
