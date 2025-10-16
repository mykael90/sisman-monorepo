import { z } from 'zod';
import { IStockMovementCountAdd } from '@/app/(main)/material/(warehouse)/stock-movement/stock-movement-types';

export const materialCountFormSchemaAdd = z.object({
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantidade é obrigatória' })
    .min(0, 'Quantidade não pode ser negativa'),
  globalMaterialId: z.string().min(1, 'Material é obrigatório'),
  warehouseId: z.number().min(1, 'Armazém é obrigatório'),
  processedByUserId: z.number().min(1, 'Usuário é obrigatório')
}) satisfies z.ZodType<IStockMovementCountAdd>;
