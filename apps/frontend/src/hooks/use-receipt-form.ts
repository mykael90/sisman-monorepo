// src/hooks/use-receipt-form.ts

import { useForm, useTransform, mergeForm } from '@tanstack/react-form';
import { IActionResultForm } from '../types/types-server-actions';
import {
  IMaterialReceiptAddForm,
  IMaterialReceiptWithRelations
} from '../app/(main)/material/(warehouse)/receipt/receipt-types';
import { toast } from 'sonner';

type UseReceiptFormProps = {
  defaultDataReceiptForm: Partial<Record<keyof IMaterialReceiptAddForm, any>>;
  serverStateReceipt?: IActionResultForm<
    IMaterialReceiptAddForm,
    IMaterialReceiptWithRelations
  >;
  formSchema?: any;
  formActionReceipt: (value: IMaterialReceiptAddForm) => Promise<void>;
};

export function useReceiptForm({
  defaultDataReceiptForm,
  serverStateReceipt,
  formSchema,
  formActionReceipt
}: UseReceiptFormProps) {
  const form = useForm({
    defaultValues: defaultDataReceiptForm as IMaterialReceiptAddForm,
    transform: useTransform(
      (baseform) => mergeForm(baseform, serverStateReceipt ?? {}),
      [serverStateReceipt]
    ),
    validators: formSchema
      ? {
          // onChange: formSchema,
          onSubmit: formSchema
        }
      : undefined,
    onSubmit: async ({ value }) => {
      await formActionReceipt(value);
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

export type IReceiptFormApi = ReturnType<typeof useReceiptForm>;
