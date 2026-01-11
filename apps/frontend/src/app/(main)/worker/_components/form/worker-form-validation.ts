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
    birthdate: z.string().min(1, 'Data de nascimento é obrigatória'),
    maintenanceInstanceId: z.number().optional().nullable(),
    file: z
      .any()
      .optional()
      .superRefine((file, ctx) => {
        if (!file || !(file instanceof File)) return;

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const ACCEPTED_FILE_TYPES = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/avif'
        ];

        if (file.size > MAX_FILE_SIZE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tamanho máximo de 5MB excedido em '${file.name}'.`
          });
        }

        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Formato de arquivo não suportado em '${file.name}'.`
          });
        }
      })
  })
  .passthrough();

export const workerFormSchemaEdit = z
  .object({
    id: z.number(),
    name: z
      .string()
      .min(1, 'Nome é obrigatório')
      .transform((val) => val.toUpperCase()),
    cpf: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val ? val.replace(/[^\d]/g, '') : val)),
    email: z.preprocess((val) => {
      if (typeof val === 'string' && val.trim() === '') {
        return null;
      }
      return val;
    }, z.string().email('Email inválido').nullable().optional()),
    phone: z
      .string()
      .nullable()
      .optional()
      .transform((val) => (val ? val.replace(/[^\d]/g, '') : val)),
    birthdate: z.string().optional(),
    maintenanceInstanceId: z.number().optional().nullable(),
    isActive: z.boolean(),
    file: z
      .any()
      .optional()
      .superRefine((file, ctx) => {
        if (!file || !(file instanceof File)) return;

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const ACCEPTED_FILE_TYPES = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/avif'
        ];

        if (file.size > MAX_FILE_SIZE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tamanho máximo de 5MB excedido em '${file.name}'.`
          });
        }

        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Formato de arquivo não suportado em '${file.name}'.`
          });
        }
      })
  })
  .superRefine((data, ctx) => {
    if (data.isActive) {
      if (!data.cpf) {
        ctx.addIssue({
          code: 'custom',
          path: ['cpf'],
          message: 'CPF é obrigatório'
        });
      } else {
        if (data.cpf.length !== 11) {
          ctx.addIssue({
            code: 'custom',
            path: ['cpf'],
            message: 'CPF deve ter 11 dígitos'
          });
        }
        if (!zodVerifyCPF(data.cpf)) {
          ctx.addIssue({
            code: 'custom',
            path: ['cpf'],
            message: 'CPF inválido'
          });
        }
      }

      if (!data.phone) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone'],
          message: 'Telefone é obrigatório'
        });
      } else {
        if (data.phone.length < 10 || data.phone.length > 11) {
          ctx.addIssue({
            code: 'custom',
            path: ['phone'],
            message: 'Telefone deve ter 10 ou 11 dígitos'
          });
        }
      }

      if (!data.birthdate) {
        ctx.addIssue({
          code: 'custom',
          path: ['birthdate'],
          message: 'Data de nascimento é obrigatória'
        });
      }
    }
  });

export type WorkerFormSchemaAdd = z.infer<typeof workerFormSchemaAdd>;
export type workerFormSchemaEdit = z.infer<typeof workerFormSchemaEdit>;
