// src/hooks/useWithdrawalForm.ts

import { useForm, useTransform, mergeForm } from '@tanstack/react-form';
import { IMaterialWithdrawalAddForm } from '../app/(main)/material/(warehouse)/withdrawal/components/form/withdrawal-base-form-add';
import { IActionResultForm } from '../types/types-server-actions';

// Tipamos os parâmetros que nosso hook receberá para ser reutilizável
type UseWithdrawalFormProps = {
  defaultDataWithdrawalForm: IMaterialWithdrawalAddForm;
  serverStateWithdrawal?: IActionResultForm<
    IMaterialWithdrawalAddForm,
    Partial<IMaterialWithdrawalAddForm>
  >;
  formActionWithdrawal: (value: IMaterialWithdrawalAddForm) => Promise<void>;
};

// O hook customizado
export function useWithdrawalForm({
  defaultDataWithdrawalForm,
  serverStateWithdrawal,
  formActionWithdrawal
}: UseWithdrawalFormProps) {
  // A única vez que `useForm` é chamado. A inferência de tipo acontece aqui.
  const form = useForm({
    defaultValues: defaultDataWithdrawalForm,
    transform: useTransform(
      (baseform) => mergeForm(baseform, serverStateWithdrawal ?? {}),
      [serverStateWithdrawal]
    ),
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
