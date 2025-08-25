// src/hooks/useWithdrawalForm.ts

import { useForm, useTransform, mergeForm } from '@tanstack/react-form';
import { IActionResultForm } from '../types/types-server-actions';
import {
  IMaterialWithdrawalAddForm,
  IMaterialWithdrawalWithRelations
} from '../app/(main)/material/(warehouse)/withdrawal/withdrawal-types';

// Tipamos os parâmetros que nosso hook receberá para ser reutilizável
type UseWithdrawalFormProps = {
  defaultDataWithdrawalForm: IMaterialWithdrawalAddForm;
  serverStateWithdrawal?: IActionResultForm<
    IMaterialWithdrawalAddForm,
    IMaterialWithdrawalWithRelations
  >;
  formSchema?: any;
  formActionWithdrawal: (value: IMaterialWithdrawalAddForm) => Promise<void>;
};

// O hook customizado
export function useWithdrawalForm({
  defaultDataWithdrawalForm,
  serverStateWithdrawal,
  formSchema,
  formActionWithdrawal
}: UseWithdrawalFormProps) {
  // A única vez que `useForm` é chamado. A inferência de tipo acontece aqui.
  const form = useForm({
    defaultValues: defaultDataWithdrawalForm,
    transform: useTransform(
      (baseform) => mergeForm(baseform, serverStateWithdrawal ?? {}),
      [serverStateWithdrawal]
    ),
    validators: formSchema
      ? {
          onChange: formSchema
          // onSubmit: formSchema
        }
      : undefined,
    onSubmit: async ({ value }) => {
      await formActionWithdrawal(value);
    }
  });

  return form;
}

// ✅ O PONTO-CHAVE DA SOLUÇÃO ✅
// `ReturnType` inspeciona a função `useWithdrawalForm` e extrai o tipo exato do que ela retorna.
// Este tipo `WithdrawalFormApi` será o tipo completo, com `Field`, `Subscribe`, `state`,
// e todos os outros membros, sem nenhuma abreviação.
export type IWithdrawalFormApi = ReturnType<typeof useWithdrawalForm>;
