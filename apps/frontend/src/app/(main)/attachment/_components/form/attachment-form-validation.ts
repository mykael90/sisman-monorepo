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
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Tamanho máximo de 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      'Formato de arquivo não suportado.'
    )
});

export type AttachmentFormSchemaAdd = z.infer<typeof attachmentFormSchemaAdd>;
