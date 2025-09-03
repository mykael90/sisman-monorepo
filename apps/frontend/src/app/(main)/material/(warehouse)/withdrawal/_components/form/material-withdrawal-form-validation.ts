import { z } from 'zod';
import {
  IMaterialWithdrawalAddForm,
  IMaterialWithdrawalItemAddForm
} from '../../withdrawal-types';
import { materialOperationOutDisplayMap } from '@/mappers/material-operations-mappers';

// Schema for a single item in the withdrawal form
const materialWithdrawalItemSchema = z.object({
  globalMaterialId: z.string().min(1, 'Material é obrigatório.'),
  quantityWithdrawn: z.coerce
    .number()
    .min(0.0001, 'Quantidade retirada deve ser maior que 0.'),
  key: z.number()
});

// Schema for the main withdrawal form (add mode)
const materialWithdrawalFormBase = z.object({
  withdrawalNumber: z.string().optional(),
  withdrawalDate: z.date({
    required_error: 'Data da Retirada é obrigatória.',
    invalid_type_error: 'Data inválida.'
  }),
  warehouseId: z.coerce.number().min(1, 'Depósito é obrigatório.'),
  processedByUserId: z.coerce.number().min(1, 'Processado por é obrigatório.'),
  // Assumindo que `z.nativeEnum(materialOperationOutDisplayMap)` fará com que
  // `movementTypeCode` contenha a *chave* do enum (ex: 'OUT_SERVICE_USAGE') como uma string.
  // Se `materialOperationOutDisplayMap` for um enum de string, o valor será a própria string.
  movementTypeCode: z.nativeEnum(materialOperationOutDisplayMap),
  notes: z.string().optional().nullable(),
  collectorType: z.string({
    required_error: 'Coletado por é obrigatório.'
  }),
  collectedByUserId: z.coerce.number().optional().nullable(),
  collectedByWorkerId: z.coerce.number().optional().nullable(),
  collectedByOther: z.string().optional().nullable(),
  maintenanceRequestId: z.coerce.number().optional().nullable(),
  materialRequestId: z.coerce.number().optional().nullable(),
  materialPickingOrderId: z.coerce.number().optional().nullable(),
  legacy_place: z.string().optional().nullable(),
  items: z
    .array(materialWithdrawalItemSchema)
    .min(1, 'Adicione pelo menos um item à retirada.')
});

// 🔹 ADD mode
const materialWithdrawalFormSchemaAdd = materialWithdrawalFormBase
  .refine(
    (data) =>
      data.movementTypeCode !==
        materialOperationOutDisplayMap.OUT_SERVICE_USAGE ||
      !!data.maintenanceRequestId,
    {
      message: 'É necessário associar uma requisição de manutenção',
      path: ['maintenanceRequestId']
    }
  )
  .refine(
    (data) =>
      (data.movementTypeCode !==
        materialOperationOutDisplayMap.OUT_SERVICE_USAGE &&
        data.movementTypeCode !==
          materialOperationOutDisplayMap.OUT_EMERGENCY_USAGE) ||
      !(data.collectorType === 'user' && !data.collectedByUserId),
    {
      message: 'Coletado pelo usuário é obrigatório.',
      path: ['collectedByUserId']
    }
  )
  .refine(
    (data) =>
      (data.movementTypeCode !==
        materialOperationOutDisplayMap.OUT_SERVICE_USAGE &&
        data.movementTypeCode !==
          materialOperationOutDisplayMap.OUT_EMERGENCY_USAGE) ||
      !(data.collectorType === 'worker' && !data.collectedByWorkerId),
    {
      message: 'Coletado por funcionário é obrigatório.',
      path: ['collectedByWorkerId']
    }
  )
  .refine(
    (data) =>
      (data.movementTypeCode !==
        materialOperationOutDisplayMap.OUT_SERVICE_USAGE &&
        data.movementTypeCode !==
          materialOperationOutDisplayMap.OUT_EMERGENCY_USAGE) ||
      !(data.collectorType === 'other' && !data.collectedByOther),
    {
      message: 'Coletado por outro é obrigatório.',
      path: ['collectedByOther']
    }
  )
  .refine(
    (data) =>
      // Se NÃO for OUT_EMERGENCY_USAGE, a regra passa (legacy_place é opcional)
      data.movementTypeCode !==
        materialOperationOutDisplayMap.OUT_EMERGENCY_USAGE ||
      // OU, se FOR OUT_EMERGENCY_USAGE, legacy_place precisa ter um valor
      !!data.legacy_place,
    {
      message:
        'A informação do local de destino é obrigatória para usos em serviço de manutenção com urgência (sem requisição de manutenção associada)',
      path: ['legacy_place']
    }
  );

// 🔹 EDIT mode
const materialWithdrawalFormSchemaEdit = materialWithdrawalFormBase
  .extend({
    id: z.coerce.number()
  })
  .refine(
    (data) =>
      data.movementTypeCode !==
        materialOperationOutDisplayMap.OUT_SERVICE_USAGE ||
      !(data.collectorType === 'user' && !data.collectedByUserId),
    {
      message: 'Coletado pelo usuário é obrigatório.',
      path: ['collectedByUserId']
    }
  )
  .refine(
    (data) =>
      data.movementTypeCode !==
        materialOperationOutDisplayMap.OUT_SERVICE_USAGE ||
      !(data.collectorType === 'worker' && !data.collectedByWorkerId),
    {
      message: 'Coletado por funcionário é obrigatório.',
      path: ['collectedByWorkerId']
    }
  )
  .refine(
    // Adicionado para consistência, o modo EDIT também deve ter esta validação condicional
    (data) =>
      data.movementTypeCode !==
        materialOperationOutDisplayMap.OUT_SERVICE_USAGE ||
      !(data.collectorType === 'other' && !data.collectedByOther),
    {
      message: 'Coletado por outro é obrigatório.',
      path: ['collectedByOther']
    }
  );

export type MaterialWithdrawalFormSchemaAdd = z.infer<
  typeof materialWithdrawalFormSchemaAdd
>;
export type MaterialWithdrawalFormSchemaEdit = z.infer<
  typeof materialWithdrawalFormSchemaEdit
>;
export { materialWithdrawalFormSchemaAdd, materialWithdrawalFormSchemaEdit };
