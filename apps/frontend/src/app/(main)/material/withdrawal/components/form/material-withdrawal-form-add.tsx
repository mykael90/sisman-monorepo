'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { FilePlus } from 'lucide-react';
import { FC, useActionState, useState } from 'react';
import { IActionResultForm } from '@/types/types-server-actions';
import { IMaterialWithdrawalRelatedData } from '../../withdrawal-types';
import { IMaintenanceRequestData } from '../request-maintenance-material-form';
import { IMaterialRequest } from '../../../request/material-request-types';
import {
  defaultDataWithdrawalForm,
  IMaterialWithdrawalAddForm,
  initialServerStateWithdrawal
} from './withdrawal-base-form-add';
import { ItemsFieldArray } from './items-field-array';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';

export function MaterialWithdrawalFormAdd({
  formActionProp,
  relatedData,
  onCancel,
  onClean,
  submitButtonText,
  SubmitButtonIcon,
  CardMaintenanceSummary,
  CardMaterialLinkDetails,
  RequestMaintenanceMaterialForm,
  WithdrawalDetailsForm
}: {
  formActionProp: (
    prevState: IActionResultForm<IMaterialWithdrawalAddForm>,
    data: IMaterialWithdrawalAddForm
  ) => Promise<IActionResultForm<IMaterialWithdrawalAddForm>>;
  onCancel?: () => void;
  onClean?: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: IMaterialWithdrawalRelatedData;
  CardMaintenanceSummary?: any;
  CardMaterialLinkDetails?: any;
  RequestMaintenanceMaterialForm?: any;
  WithdrawalDetailsForm: any;
}) {
  const { listGlobalMaterials, listUsers } = relatedData;

  const [maintenanceRequestData, setMaintenanceRequestData] =
    useState<IMaintenanceRequestData | null>(null);

  const [materialRequestData, setMaterialRequestData] =
    useState<IMaterialRequest | null>(null);

  const [linkMaterialRequest, setLinkMaterialRequest] = useState(false);
  const [materialRequestDataLinked, setMaterialRequestDataLinked] =
    useState<any>(null);

  const [serverStateWithdrawal, formActionWithdrawal, isPendingWithdrawal] =
    useActionState(formActionProp, initialServerStateWithdrawal);

  const formWithdrawal = useForm({
    defaultValues: defaultDataWithdrawalForm,
    transform: useTransform(
      (baseform) => mergeForm(baseform, serverStateWithdrawal ?? {}),
      [serverStateWithdrawal]
    ),
    onSubmit: async ({ value }) => {
      await formActionWithdrawal(value);
    }
  });

  const handleReset = onClean
    ? () => {
        formWithdrawal.reset();
        onClean && onClean();
      }
    : () => formWithdrawal.reset();

  const handleCancel = () => {
    onCancel && onCancel();
  };

  if (
    serverStateWithdrawal?.isSubmitSuccessful &&
    serverStateWithdrawal.responseData
  ) {
    return (
      <FormSuccessDisplay
        serverState={serverStateWithdrawal}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        messageActions={{
          handleResetForm: 'Realizar nova retirada',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={false}
      />
    );
  }

  const currentSubmitButtonText = submitButtonText || 'Realizar retirada';

  const CurrentSubmitButtonIcon = (SubmitButtonIcon && (
    <SubmitButtonIcon className='mr-2 h-5 w-5' />
  )) || <FilePlus className='mr-2 h-5 w-5' />;

  return (
    <div className='space-y-6'>
      {/* Formulário para fazer consulta de requisição de manutenção ou material */}
      {RequestMaintenanceMaterialForm && (
        <RequestMaintenanceMaterialForm
          setMaintenanceRequestData={setMaintenanceRequestData}
          maintenanceRequestData={maintenanceRequestData}
          setMaterialRequestData={setMaterialRequestData}
          materialRequestData={materialRequestData}
        />
      )}
      <form
        id='form-withdrawal'
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          formWithdrawal.handleSubmit();
        }}
        onReset={(e) => {
          e.preventDefault();
          handleReset();
        }}
      >
        <ErrorServerForm serverState={serverStateWithdrawal} />
        <div className='space-y-6'>
          {/* Informações extraídas da requisição de manutenção 
          Só renderiza o card se houver dados da requisição
          */}
          {CardMaintenanceSummary && maintenanceRequestData?.id && (
            <CardMaintenanceSummary
              maintenanceRequestData={maintenanceRequestData}
            />
          )}
          {/* Withdrawal Details */}
          {WithdrawalDetailsForm && (
            <WithdrawalDetailsForm formWithdrawal={formWithdrawal} />
          )}

          {/* Material Requisition Link */}
          {CardMaterialLinkDetails && (
            <CardMaterialLinkDetails
              linkMaterialRequest={linkMaterialRequest}
              setLinkMaterialRequest={setLinkMaterialRequest}
              formWithdrawal={formWithdrawal}
              setMaterialRequestDataLinked={setMaterialRequestDataLinked}
              materialRequestDataLinked={materialRequestDataLinked}
              materialRequestData={
                maintenanceRequestData?.materialRequests ||
                materialRequestData ||
                []
              }
            />
          )}

          {/* Items for Withdrawal */}
          {!linkMaterialRequest && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Materiais para Retirada
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <formWithdrawal.Field name='items' mode='array'>
                  {(field) => (
                    <ItemsFieldArray
                      field={field}
                      listGlobalMaterials={listGlobalMaterials}
                    />
                  )}
                </formWithdrawal.Field>
              </CardContent>
            </Card>
          )}
        </div>
        <div className='mt-8 flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type='reset' variant='outline'>
            Limpar
          </Button>
          <formWithdrawal.Subscribe
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
                  !canSubmit ||
                  isPendingWithdrawal ||
                  isValidating ||
                  !isTouched
                }
              >
                {isPendingWithdrawal || isValidating
                  ? 'Processando...'
                  : CurrentSubmitButtonIcon}
                {isPendingWithdrawal || isValidating
                  ? ''
                  : currentSubmitButtonText}
              </Button>
            )}
          </formWithdrawal.Subscribe>
        </div>
      </form>
    </div>
  );
}
