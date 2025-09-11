import { z } from 'zod';
import {
  IMaterialReceiptAddForm,
  IMaterialReceiptItemAddForm
} from '../../receipt-types';
import { materialOperationInDisplayMap } from '@/mappers/material-operations-mappers';

const materialReceiptItemSchema = z.object({
  materialId: z.string().min(1, 'Material é obrigatório.'),
  quantityReceived: z.coerce
    .number()
    .min(0.0001, 'Quantidade recebida deve ser maior que 0.'),
  key: z.union([z.string(), z.number()])
});

const materialReceiptFormBase = z.object({
  receiptNumber: z.string().optional(),
  receiptDate: z.date({
    required_error: 'Data da Entrada é obrigatória.',
    invalid_type_error: 'Data inválida.'
  }),
  destinationWarehouseId: z.coerce.number().min(1, 'Depósito é obrigatório.'),
  processedByUserId: z.coerce.number().min(1, 'Processado por é obrigatório.'),
  movementTypeCode: z.nativeEnum(materialOperationInDisplayMap),
  notes: z.string().optional().nullable(),
  sourceName: z.string().min(1, 'Fornecedor (ou doador) é obrigatório.'),
  externalReference: z.string().min(1, 'Documento de entrada é obrigatório.'),
  items: z
    .array(materialReceiptItemSchema)
    .min(1, 'Adicione pelo menos um item à entrada.')
});

const materialReceiptMaterialRequest = z.object({
  receiptNumber: z.string().optional(),
  receiptDate: z.date({
    required_error: 'Data da Entrada é obrigatória.',
    invalid_type_error: 'Data inválida.'
  }),
  destinationWarehouseId: z.coerce.number().min(1, 'Depósito é obrigatório.'),
  processedByUserId: z.coerce.number().min(1, 'Processado por é obrigatório.'),
  movementTypeCode: z.nativeEnum(materialOperationInDisplayMap),
  notes: z.string().optional().nullable(),
  items: z
    .array(materialReceiptItemSchema)
    .min(1, 'Adicione pelo menos um item à entrada.')
});

const materialReceiptFormSchemaAddMaterialRequest =
  materialReceiptMaterialRequest;
const materialReceiptFormSchemaAdd = materialReceiptFormBase;

const materialReceiptFormSchemaEdit = materialReceiptFormBase.extend({
  id: z.coerce.number()
});

export type MaterialReceiptFormSchemaAdd = z.infer<
  typeof materialReceiptFormSchemaAdd
>;
export type MaterialReceiptFormSchemaEdit = z.infer<
  typeof materialReceiptFormSchemaEdit
>;
export {
  materialReceiptFormSchemaAdd,
  materialReceiptFormSchemaAddMaterialRequest,
  materialReceiptFormSchemaEdit
};
