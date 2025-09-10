'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus } from 'lucide-react';
import { FC, useActionState } from 'react';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IMaterialReceiptAddForm,
  IMaterialReceiptRelatedData,
  IMaterialReceiptWithRelations
} from '../../receipt-types';
import { ItemsFieldArray } from './field-form-items-array';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import {
  useReceiptForm,
  type IReceiptFormApi
} from '@/src/hooks/use-receipt-form';
import { ErrorClientValidationFormCard } from '@/components/form-tanstack/error-client-validation-form-card';
import { FormSuccessDisplayCard } from '@/components/form-tanstack/form-success-display-card';
import { ReceiptDetails } from '../add/receipt-details';
import {
  materialOperationInDisplayMap,
  MaterialOperationInKey
} from '@/mappers/material-operations-mappers';
import { ItemsFieldArrayMaterialRequest } from './field-form-items-array-material-request';
import { IMaterialReceiptItemAddFormInfo } from './table-form-items-material-request';
import { set } from 'date-fns';

export function MaterialReceiptForm({
  defaultData,
  formActionProp,
  relatedData,
  submitButtonText,
  SubmitButtonIcon,
  initialServerStateReceipt = {
    isSubmitSuccessful: false,
    message: ''
  },
  onCancel,
  onClean,
  movementTypeCode,
  formSchema,
  materialInfo
}: {
  defaultData: Partial<Record<keyof IMaterialReceiptAddForm, any>>;
  formActionProp: (
    prevState: IActionResultForm<
      IMaterialReceiptAddForm,
      IMaterialReceiptWithRelations
    >,
    data: IMaterialReceiptAddForm
  ) => Promise<
    IActionResultForm<IMaterialReceiptAddForm, IMaterialReceiptWithRelations>
  >;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: IMaterialReceiptRelatedData;
  initialServerStateReceipt?: IActionResultForm<
    IMaterialReceiptAddForm,
    IMaterialReceiptWithRelations
  >;
  onCancel?: () => void;
  onClean?: () => void;
  movementTypeCode: MaterialOperationInKey;
  formSchema?: any;
  materialInfo?: IMaterialReceiptItemAddFormInfo[];
}) {
  const [serverStateReceipt, formActionReceipt, isPendingReceipt] =
    useActionState(formActionProp, initialServerStateReceipt);

  const { materialRequest } = relatedData;

  const formReceipt: IReceiptFormApi = useReceiptForm({
    defaultDataReceiptForm: {
      ...defaultData
    },
    serverStateReceipt: serverStateReceipt,
    formSchema: formSchema,
    formActionReceipt: async (value) => await formActionReceipt(value)
  });

  const handleReset = () => {
    formReceipt.reset();
    onClean && onClean();
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  if (
    serverStateReceipt?.isSubmitSuccessful &&
    serverStateReceipt.responseData
  ) {
    return (
      <FormSuccessDisplayCard
        serverState={serverStateReceipt}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        messageActions={{
          handleResetForm: 'Realizar nova entrada',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={false}
      />
    );
  }

  const currentSubmitButtonText = submitButtonText || 'Realizar entrada';

  const currentSubmitButtonIcon = (SubmitButtonIcon && (
    <SubmitButtonIcon className='mr-2 h-5 w-5' />
  )) || <FilePlus className='mr-2 h-5 w-5' />;

  return (
    <div className='space-y-6'>
      <ErrorServerForm serverState={serverStateReceipt} />

      <formReceipt.Subscribe
        selector={(state) => [state.errors, state.submissionAttempts]}
      >
        {([errors, submissionAttempts]) => {
          if (submissionAttempts === 0 || !errors || !submissionAttempts)
            return null;
          return <ErrorClientValidationFormCard errors={errors} />;
        }}
      </formReceipt.Subscribe>

      <form
        id='form-receipt'
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          formReceipt.handleSubmit();
        }}
        onReset={(e) => {
          e.preventDefault();
          handleReset();
        }}
      >
        <div className='space-y-6'>
          {movementTypeCode !== materialOperationInDisplayMap.IN_CENTRAL && (
            <ReceiptDetails formReceipt={formReceipt} />
          )}

          {movementTypeCode === materialOperationInDisplayMap.IN_CENTRAL &&
            materialInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Materiais para Entrada Por Requisição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <formReceipt.Field name='items' mode='array'>
                    {(field) => (
                      <ItemsFieldArrayMaterialRequest
                        field={field}
                        materialInfo={materialInfo}
                      />
                    )}
                  </formReceipt.Field>
                </CardContent>
              </Card>
            )}

          {movementTypeCode !== materialOperationInDisplayMap.IN_CENTRAL && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Materiais para Entrada
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <formReceipt.Field name='items' mode='array'>
                  {(field) => <ItemsFieldArray field={field} />}
                </formReceipt.Field>
              </CardContent>
            </Card>
          )}
        </div>
        <div className='mt-8 flex flex-wrap justify-end gap-3'>
          <div className='flex gap-3'>
            <Button type='button' variant='outline' onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type='reset' variant='outline'>
              Limpar
            </Button>
          </div>
          <div className='flex'>
            <formReceipt.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isTouched,
                state.isValidating
              ]}
            >
              {([canSubmit, isTouched, isValidating]) => (
                <Button
                  type='submit'
                  disabled={
                    !canSubmit || isPendingReceipt || isValidating
                    // || !isTouched
                  }
                >
                  {isPendingReceipt || isValidating
                    ? 'Processando...'
                    : currentSubmitButtonIcon}
                  {isPendingReceipt || isValidating
                    ? ''
                    : currentSubmitButtonText}
                </Button>
              )}
            </formReceipt.Subscribe>
          </div>
        </div>
      </form>
    </div>
  );
}
