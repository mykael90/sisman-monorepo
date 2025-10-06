import { z } from 'zod';

export const workerManualFrequencyFormSchemaAdd = z
  .object({
    workerId: z.number().min(1, 'Colaborador é obrigatório'),
    date: z.date({ required_error: 'Data é obrigatória' }),
    hours: z.number().min(1, 'Hora de início é obrigatória'),
    workerManualFrequencyTypeId: z
      .number()
      .min(1, 'Tipo de frequência é obrigatório'),
    userId: z.number(),
    notes: z.string().optional()
  })
  .passthrough();

export const workerManualFrequencyFormSchemaEdit =
  workerManualFrequencyFormSchemaAdd.extend({
    id: z.number()
  });

export type WorkerManualFrequencyFormSchemaAdd = z.infer<
  typeof workerManualFrequencyFormSchemaAdd
>;
export type WorkerManualFrequencyFormSchemaEdit = z.infer<
  typeof workerManualFrequencyFormSchemaEdit
>;
