import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export const attachmentFormSchemaAdd = z.object({
  relatedId: z.union([
    z.number(),
    z.string().min(1, 'ID relacionado é obrigatório')
  ]),
  relatedModel: z.string().min(1, 'Modelo relacionado é obrigatório'),
  file: z
    .any()
    .refine((file) => file instanceof File, 'Arquivo é obrigatório')
    .superRefine((file, ctx) => {
      if (!(file instanceof File)) return;

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
});

export const attachmentFormSchemaAddBatch = z.object({
  relatedId: z.union([
    z.number(),
    z.string().min(1, 'ID relacionado é obrigatório')
  ]),
  relatedModel: z.string().min(1, 'Modelo relacionado é obrigatório'),
  files: z
    .array(z.any())
    .min(1, 'Selecione ao menos um arquivo')
    .superRefine((files, ctx) => {
      files.forEach((file) => {
        if (!(file instanceof File)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `O item selecionado não é um arquivo válido.`
          });
          return;
        }

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
      });
    })
});

export type AttachmentFormSchemaAdd = z.infer<typeof attachmentFormSchemaAdd>;
export type AttachmentFormSchemaAddBatch = z.infer<
  typeof attachmentFormSchemaAddBatch
>;
