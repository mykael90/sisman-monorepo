import { z } from 'zod';
import { IWarehouseAdd, IWarehouseEdit } from '../../warehouse-types';

// Schema para adicionar warehouse
export const warehouseFormSchemaAdd = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  maintenanceInstanceId: z
    .number()
    .min(1, 'Instância de manutenção é obrigatória')
}) satisfies z.ZodType<IWarehouseAdd>;

// Schema para editar warehouse
export const warehouseFormSchemaEdit = warehouseFormSchemaAdd.extend({
  id: z.number().min(1)
}) satisfies z.ZodType<IWarehouseEdit>;
