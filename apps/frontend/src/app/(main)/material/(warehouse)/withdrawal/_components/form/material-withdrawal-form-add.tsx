'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
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
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import { IMaintenanceRequestWithRelations } from '../../../../../maintenance/request/request-types';
import {
  useWithdrawalForm,
  type IWithdrawalFormApi
} from '@/src/hooks/use-withdrawal-form';
import { useSession } from 'next-auth/react';
import Loading from '../../../../../../../components/loading';
import { useWarehouseContext } from '../../../../choose-warehouse/context/warehouse-provider';
import { WithdrawalDetailUsageServiceProps } from '../../add/OUT_SERVICE_USAGE/components/withdrawal-details-usage-service';
import { materialWithdrawalFormSchemaAdd } from './material-withdrawal-form-validation';

export function MaterialWithdrawalFormAdd({
  defaultData,
  formActionProp,
  relatedData,
  onCancel,
  onClean,
  submitButtonText,
  SubmitButtonIcon,
  CardMaintenanceSummary,
  CardMaterialLinkDetails,
  RequestMaintenanceMaterialForm,
  WithdrawalDetailsForm,
  initialServerStateWithdrawal = {
    isSubmitSuccessful: false,
    message: ''
  }
}: {
  defaultData: IMaterialWithdrawalAddForm;
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
  onCancel?: () => void;
  onClean?: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: IMaterialWithdrawalRelatedData;
  CardMaintenanceSummary?: any;
  CardMaterialLinkDetails?: any;
  RequestMaintenanceMaterialForm?: any;
  WithdrawalDetailsForm: FC<WithdrawalDetailUsageServiceProps>;
  initialServerStateWithdrawal?: IActionResultForm<
    IMaterialWithdrawalAddForm,
    IMaterialWithdrawalWithRelations
  >;
}) {
  // --- 1. CHAMAR TODOS OS HOOKS NO TOPO, INCONDICIONALMENTE ---
  const { warehouse } = useWarehouseContext();

  const [maintenanceRequestData, setMaintenanceRequestData] =
    useState<IMaintenanceRequestWithRelations | null>(null);

  const [materialRequestData, setMaterialRequestData] =
    useState<IMaterialRequest | null>(null);

  const [linkMaterialRequest, setLinkMaterialRequest] =
    useState<boolean>(false);

  const [serverStateWithdrawal, formActionWithdrawal, isPendingWithdrawal] =
    useActionState(formActionProp, initialServerStateWithdrawal);

  // Use o hook para obter a instância do formulário
  const formWithdrawal: IWithdrawalFormApi = useWithdrawalForm({
    defaultDataWithdrawalForm: {
      ...defaultData,
      warehouseId: warehouse?.id as number
    },
    serverStateWithdrawal: serverStateWithdrawal,
    formSchema: materialWithdrawalFormSchemaAdd,
    formActionWithdrawal: async (value) => await formActionWithdrawal(value)
  });

  const { listUsers } = relatedData;

  // const formWithdrawal = useForm({
  //   defaultValues: defaultDataWithdrawalForm,
  //   transform: useTransform(
  //     (baseform) => mergeForm(baseform, serverStateWithdrawal ?? {}),
  //     [serverStateWithdrawal]
  //   ),
  //   onSubmit: async ({ value }) => {
  //     await formActionWithdrawal(value);
  //   }
  // });

  // A verificação `!userId` também protege contra o valor `NaN`.
  if (!warehouse?.id) {
    return <p>Acesso negado. Por favor, selecione um almoxarifado.</p>;
  }

  // --- 3. O RESTO DO SEU COMPONENTE ---
  // A partir daqui, você tem a garantia de que `session` e `warehouseId` existem e `userId` é um número válido.

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
      {console.log(typeof formWithdrawal)}

      {/* Erros lado cliente */}
      {(() => {
        const errorMessages = (formWithdrawal.state.errors ?? [])
          .flatMap((errorGroup: any) => Object.values(errorGroup))
          .flat()
          .map((error: any) => error.message)
          .filter(Boolean);

        if (errorMessages.length === 0) return null;

        return (
          <Card className="border-destructive bg-destructive/10 text-destructive">
            <CardHeader>
              <CardTitle>Corrija os seguintes erros:</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              {errorMessages.map((msg, i) => (
                <p key={i}>- {msg}</p>
              ))}
            </CardContent>
          </Card>
        );
      })()}

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
              setFieldValue={formWithdrawal.setFieldValue}
            />
          )}
          {/* Withdrawal Details */}
          {WithdrawalDetailsForm && (
            <WithdrawalDetailsForm
              formWithdrawal={formWithdrawal}
              listUsers={listUsers}
            />
          )}

          {/* Material Requisition Link */}
          {CardMaterialLinkDetails &&
            maintenanceRequestData?.materialRequests && (
              <CardMaterialLinkDetails
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
