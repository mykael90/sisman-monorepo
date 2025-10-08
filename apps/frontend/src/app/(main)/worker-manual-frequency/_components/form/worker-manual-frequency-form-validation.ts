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
    workerContractId: z
      .number()
      .min(1, 'Contrato do trabalhador é obrigatório'),
    notes: z.string().nullable().optional()
  })
  .strip();

export const workerManualFrequencyFormSchemaAddBulk = z
  .object({
    items: z.array(
      z.object({
        // key: z.number(),
        workerId: z.number().min(1, 'Colaborador é obrigatório'),
        date: z.date({ required_error: 'Data é obrigatória' }),
        hours: z.number().min(1, 'Hora de início é obrigatória'),
        workerManualFrequencyTypeId: z
          .number()
          .min(1, 'Tipo de frequência é obrigatória'),
        userId: z.number(),
        workerContractId: z
          .number()
          .min(1, 'Contrato do trabalhador é obrigatório'),
        notes: z.string().optional()
      })
    )
  })
  .strip();

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
