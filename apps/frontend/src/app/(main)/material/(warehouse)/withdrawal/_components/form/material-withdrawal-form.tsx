'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus } from 'lucide-react';
import { FC, useActionState, useState } from 'react';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  IMaterialWithdrawalAddForm,
  IMaterialWithdrawalRelatedData,
  IMaterialWithdrawalWithRelations
} from '../../withdrawal-types';
import { IMaterialRequest } from '../../../../request/material-request-types';
import { ItemsFieldArray } from './field-form-items-array';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import { IMaintenanceRequestWithRelations } from '../../../../../maintenance/request/request-types';
import {
  useWithdrawalForm,
  type IWithdrawalFormApi
} from '@/src/hooks/use-withdrawal-form';
import { materialWithdrawalFormSchemaAdd } from './material-withdrawal-form-validation';
import { ErrorClientValidationFormCard } from '../../../../../../../components/form-tanstack/error-client-validation-form-card';
import { FormSuccessDisplayCard } from '../../../../../../../components/form-tanstack/form-success-display-card';
import { useRouter } from 'next/navigation';
import { CardMaintenanceSummary } from '../card-maintenance-summary';
import { CardMaterialRequestLinkDetails } from '../card-material-link-details';
import { WithdrawalDetailUsageService } from '../add/withdrawal-details-usage-service';
import {
  materialOperationOutDisplayMap,
  MaterialOperationOutKey
} from '../../../../../../../mappers/material-operations-mappers';
import { totalmem } from 'os';
import { toast } from 'sonner';

export function MaterialWithdrawalForm({
  defaultData,
  formActionProp,
  relatedData,
  submitButtonText,
  SubmitButtonIcon,
  initialServerStateWithdrawal = {
    isSubmitSuccessful: false,
    message: ''
  },
  maintenanceRequestData,
  materialRequestData,
  onCancel,
  onClean,
  movementTypeCode
}: {
  defaultData: Partial<Record<keyof IMaterialWithdrawalAddForm, any>>;
  formActionProp: (
    prevState: IActionResultForm<
      IMaterialWithdrawalAddForm,
      IMaterialWithdrawalWithRelations
    >,
    data: IMaterialWithdrawalAddForm
  ) => Promise<
    IActionResultForm<
      IMaterialWithdrawalAddForm,
      IMaterialWithdrawalWithRelations
    >
  >;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: IMaterialWithdrawalRelatedData;
  initialServerStateWithdrawal?: IActionResultForm<
    IMaterialWithdrawalAddForm,
    IMaterialWithdrawalWithRelations
  >;
  maintenanceRequestData?: IMaintenanceRequestWithRelations | null;
  materialRequestData?: IMaterialRequest | null;
  onCancel?: () => void;
  onClean?: () => void;
  movementTypeCode: MaterialOperationOutKey;
}) {
  const [linkMaterialRequest, setLinkMaterialRequest] =
    useState<boolean>(false);

  const [serverStateWithdrawal, formActionWithdrawal, isPendingWithdrawal] =
    useActionState(formActionProp, initialServerStateWithdrawal);

  // Use o hook para obter a instância do formulário, a partir do hook tipei o formulario
  const formWithdrawal: IWithdrawalFormApi = useWithdrawalForm({
    defaultDataWithdrawalForm: {
      ...defaultData
    },
    serverStateWithdrawal: serverStateWithdrawal,
    formSchema: materialWithdrawalFormSchemaAdd,
    formActionWithdrawal: async (value) => await formActionWithdrawal(value)
  });

  const { listUsers, listWorkers } = relatedData;

  const handleReset = () => {
    formWithdrawal.reset();
    onClean && onClean();
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  if (
    serverStateWithdrawal?.isSubmitSuccessful &&
    serverStateWithdrawal.responseData
  ) {
    toast.success(serverStateWithdrawal.message);
    handleReset();
    // return (
    //   <FormSuccessDisplayCard
    //     serverState={serverStateWithdrawal}
    //     handleActions={{
    //       handleResetForm: handleReset,
    //       handleCancelForm: handleCancel
    //     }}
    //     messageActions={{
    //       handleResetForm: 'Realizar nova retirada',
    //       handleCancel: 'Voltar para a lista'
    //     }}
    //     isInDialog={false}
    //   />
    // );
  }

  const currentSubmitButtonText = submitButtonText || 'Realizar retirada';

  const currentSubmitButtonIcon = (SubmitButtonIcon && (
    <SubmitButtonIcon className='mr-2 h-5 w-5' />
  )) || <FilePlus className='mr-2 h-5 w-5' />;

  return (
    <div className='space-y-6'>
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
        {/* Erros do lado do servidor */}
        <ErrorServerForm serverState={serverStateWithdrawal} />

        {/* Erros lado cliente */}
        <formWithdrawal.Subscribe
          selector={(state) => [state.errors, state.submissionAttempts]}
        >
          {([errors, submissionAttempts]) => {
            if (submissionAttempts === 0 || !errors || !submissionAttempts)
              return null;
            return <ErrorClientValidationFormCard errors={errors} />;
          }}
        </formWithdrawal.Subscribe>

        <div className='space-y-6'>
          {/* Informações extraídas da requisição de manutenção 
          Só renderiza o card se houver dados da requisição
          */}
          {maintenanceRequestData && (
            <CardMaintenanceSummary
              maintenanceRequestData={maintenanceRequestData}
              setFieldValue={formWithdrawal.setFieldValue}
            />
          )}

          {/* Withdrawal Details */}
          {movementTypeCode ===
            materialOperationOutDisplayMap.OUT_SERVICE_USAGE && (
            <WithdrawalDetailUsageService
              formWithdrawal={formWithdrawal}
              listUsers={listUsers}
              listWorkers={listWorkers}
            />
          )}

          {/* Material Requisition Link */}
          {movementTypeCode ===
            materialOperationOutDisplayMap.OUT_SERVICE_USAGE &&
            maintenanceRequestData?.materialRequests && (
              <CardMaterialRequestLinkDetails
                linkMaterialRequest={linkMaterialRequest}
                setLinkMaterialRequest={setLinkMaterialRequest}
                formWithdrawal={formWithdrawal}
                materialRequestDataLinked={
                  maintenanceRequestData?.materialRequests
                }
                setFieldValue={formWithdrawal.setFieldValue}
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
                  {(field) => <ItemsFieldArray field={field} />}
                </formWithdrawal.Field>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Botões reset, cancel e submit */}
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
                    : currentSubmitButtonIcon}
                  {isPendingWithdrawal || isValidating
                    ? ''
                    : currentSubmitButtonText}
                </Button>
              )}
            </formWithdrawal.Subscribe>
          </div>
        </div>
      </form>
    </div>
  );
}
