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
import { ErrorClientValidationFormCard } from '../../../../../../../components/form-tanstack/error-client-validation-form-card';
import { FormSuccessDisplayCard } from '../../../../../../../components/form-tanstack/form-success-display-card';
import { useRouter } from 'next/navigation';
import { set } from 'date-fns';

export function MaterialWithdrawalFormAdd({
  defaultData,
  formActionProp,
  relatedData,
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

  const router = useRouter();

  const redirectList = () => {
    router.push('/material/withdrawal/');
  };

  const { listUsers, listWorkers } = relatedData;

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

  const handleReset = () => {
    console.log('resetando form');
    // TODO: depois utilizar um reset mais suave. o problema é resetar o action state.
    // formWithdrawal.reset();
    // formActionWithdrawal(initialServerStateWithdrawal);
    // setMaintenanceRequestData(null);
    // setMaterialRequestData(null);
    // setLinkMaterialRequest(false);
    window.location.reload();
  };

  const handleCancel = () => {
    redirectList();
  };

  if (
    serverStateWithdrawal?.isSubmitSuccessful &&
    serverStateWithdrawal.responseData
  ) {
    return (
      <FormSuccessDisplayCard
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
      <formWithdrawal.Subscribe
        selector={(state) => [state.errors, state.submissionAttempts]}
      >
        {([errors, submissionAttempts]) => {
          if (submissionAttempts === 0 || !errors || !submissionAttempts)
            return null;
          return <ErrorClientValidationFormCard errors={errors} />;
        }}
      </formWithdrawal.Subscribe>

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
              listWorkers={listWorkers}
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
                    : CurrentSubmitButtonIcon}
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
