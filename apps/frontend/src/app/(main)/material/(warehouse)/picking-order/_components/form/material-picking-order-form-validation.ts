import { z } from 'zod';
import {
  IMaterialPickingOrderAddForm,
  IMaterialPickingOrderItemAddForm
} from '../../material-picking-order-types';

// Schema for a single item in the pickingorder form
const materialPickingOrderItemSchema = z.object({
  globalMaterialId: z.string().min(1, 'Material é obrigatório.'),
  quantityToPick: z.coerce
    .number()
    .min(0.0001, 'Quantidade retirada deve ser maior que 0.'),
  key: z.number()
});

// Schema for the main pickingorder form (add mode)
const materialPickingOrderFormBase = z.object({
  desiredPickupDate: z.date({
    required_error: 'Data da Previsão de Retirada é Obrigatória.',
    invalid_type_error: 'Data inválida.'
  }),
  warehouseId: z.coerce.number().min(1, 'Depósito é obrigatório.'),
  requestedByUserId: z.coerce.number().min(1, 'Requisitado por é obrigatório.'),
  // Assumindo que `z.nativeEnum(materialOperationOutDisplayMap)` fará com que
  // `movementTypeCode` contenha a *chave* do enum (ex: 'OUT_SERVICE_USAGE') como uma string.
  // Se `materialOperationOutDisplayMap` for um enum de string, o valor será a própria string.
  notes: z.string().optional().nullable(),
  collectorType: z.string({
    required_error: 'Coletado por é obrigatório.'
  }),
  beCollectedByUserId: z.coerce.number().optional().nullable(),
  beCollectedByWorkerId: z.coerce.number().optional().nullable(),
  collectedByOther: z.string().optional().nullable(),
  maintenanceRequestId: z.coerce.number().optional().nullable(),
  materialRequestId: z.coerce.number().optional().nullable(),
  legacy_place: z.string().optional().nullable(),
  items: z
    .array(materialPickingOrderItemSchema)
    .min(1, 'Adicione pelo menos um item à retirada.')
});

// 🔹 ADD mode
const materialPickingOrderFormSchemaAdd = materialPickingOrderFormBase
  // .refine(
  //   (data) => !!data.maintenanceRequestId || !!data.materialRequestId,
  //   //só vai ser necessário associar a requisição de manutenção se não tiver uma requisição de material definida.
  //   // pode ter requisicao de material sem ta associada a requisicao de manutencao (como por exemplo butijoes de agua)
  //   {
  //     message: 'É necessário associar uma requisição de manutenção',
  //     path: ['maintenanceRequestId']
  //   }
  // )
  .refine(
    (data) => !(data.collectorType === 'user' && !data.beCollectedByUserId),
    {
      message: 'Coletado pelo usuário é obrigatório.',
      path: ['beCollectedByUserId']
    }
  )
  .refine(
    (data) => !(data.collectorType === 'worker' && !data.beCollectedByWorkerId),
    {
      message: 'Coletado por funcionário é obrigatório.',
      path: ['beCollectedByWorkerId']
    }
  )
  .refine(
    (data) => !(data.collectorType === 'other' && !data.collectedByOther),
    {
      message: 'Coletado por outro é obrigatório.',
      path: ['collectedByOther']
    }
  )
  .refine(
    (data) =>
      // Se tiver uma requisicao de manutencao, a regra passa (legacy_place é opcional)
      !!data.maintenanceRequestId ||
      !!data.materialRequestId ||
      // OU, se FOR OUT_EMERGENCY_USAGE, legacy_place precisa ter um valor
      !!data.legacy_place,
    {
      message:
        'A informação do local de destino é obrigatória para usos em serviço de manutenção com urgência (sem requisição de manutenção associada)',
      path: ['legacy_place']
    }
  );

// 🔹 EDIT mode
const materialPickingOrderFormSchemaEdit = materialPickingOrderFormBase
  .extend({
    id: z.coerce.number()
  })
  .refine(
    (data) => !(data.collectorType === 'user' && !data.beCollectedByUserId),
    {
      message: 'Coletado pelo usuário é obrigatório.',
      path: ['beCollectedByUserId']
    }
  )
  .refine(
    (data) => !(data.collectorType === 'worker' && !data.beCollectedByWorkerId),
    {
      message: 'Coletado por funcionário é obrigatório.',
      path: ['beCollectedByWorkerId']
    }
  )
  .refine(
    // Adicionado para consistência, o modo EDIT também deve ter esta validação condicional
    (data) => !(data.collectorType === 'other' && !data.collectedByOther),
    {
      message: 'Coletado por outro é obrigatório.',
      path: ['collectedByOther']
    }
  );

export type MaterialPickingOrderFormSchemaAdd = z.infer<
  typeof materialPickingOrderFormSchemaAdd
>;
export type MaterialPickingOrderFormSchemaEdit = z.infer<
  typeof materialPickingOrderFormSchemaEdit
>;
export {
  materialPickingOrderFormSchemaAdd,
  materialPickingOrderFormSchemaEdit
};
