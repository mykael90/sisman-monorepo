import { z } from 'zod';

export const maintenanceInstanceFormSchemaAdd = z.object({
  name: z.string().min(1, 'O nome da instância é obrigatório'),
  sipacId: z.string().min(1, 'O código SIPAC é obrigatório')
});

export const maintenanceInstanceFormSchemaEdit = z.object({
  id: z.number(),
  name: z.string().min(1, 'O nome da instância é obrigatório'),
  sipacId: z.string().min(1, 'O código SIPAC é obrigatório')
});

export type MaintenanceInstanceFormValues = z.infer<
  typeof maintenanceInstanceFormSchemaAdd
>;

export type MaintenanceInstanceFormValuesEdit = z.infer<
  typeof maintenanceInstanceFormSchemaEdit
>;
