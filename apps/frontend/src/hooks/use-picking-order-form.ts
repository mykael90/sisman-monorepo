// src/hooks/usePickingOrderForm.ts

import { useForm, useTransform, mergeForm } from '@tanstack/react-form';
import { IActionResultForm } from '../types/types-server-actions';
import {
  IMaterialPickingOrderAddForm,
  IMaterialPickingOrderWithRelations
} from '../app/(main)/material/(warehouse)/picking-order/material-picking-order-types';
import { toast } from 'sonner';

// Tipamos os parâmetros que nosso hook receberá para ser reutilizável
type UsePickingOrderFormProps = {
  defaultDataPickingOrderForm: Partial<
    Record<keyof IMaterialPickingOrderAddForm, any>
  >;
  serverStatePickingOrder?: IActionResultForm<
    IMaterialPickingOrderAddForm,
    IMaterialPickingOrderWithRelations
  >;
  formSchema?: any;
  formActionPickingOrder: (
    value: IMaterialPickingOrderAddForm
  ) => Promise<void>;
};

// O hook customizado
export function usePickingOrderForm({
  defaultDataPickingOrderForm,
  serverStatePickingOrder,
  formSchema,
  formActionPickingOrder
}: UsePickingOrderFormProps) {
  // A única vez que `useForm` é chamado. A inferência de tipo acontece aqui.
  const form = useForm({
    defaultValues: defaultDataPickingOrderForm,
    transform: useTransform(
      (baseform) => mergeForm(baseform, serverStatePickingOrder ?? {}),
      [serverStatePickingOrder]
    ),
    validators: formSchema
      ? {
          // onChange: formSchema,
          onSubmit: formSchema
        }
      : undefined,
    onSubmit: async ({ value }) => {
      await formActionPickingOrder(value);
    },
    onSubmitInvalid: (props) => {
      console.log('onSubmitInvalid', props);
      toast.error(
        `Erro no envio do formulário, verifique os campos e tente novamente`
      );
    }
  });

  return form;
}

// ✅ O PONTO-CHAVE DA SOLUÇÃO ✅
// `ReturnType` inspeciona a função `usePickingOrderForm` e extrai o tipo exato do que ela retorna.
// Este tipo `PickingOrderFormApi` será o tipo completo, com `Field`, `Subscribe`, `state`,
// e todos os outros membros, sem nenhuma abreviação.
export type IPickingOrderFormApi = ReturnType<typeof usePickingOrderForm>;
