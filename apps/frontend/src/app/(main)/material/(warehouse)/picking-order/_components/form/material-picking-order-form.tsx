'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, FilePlus } from 'lucide-react';
import { FC, useActionState, useState } from 'react';
import { IActionResultForm } from '@/types/types-server-actions';
import {
  fieldsLabelsPickingOrderForm,
  IMaterialPickingOrderAddForm,
  IMaterialPickingOrderRelatedData,
  IMaterialPickingOrderWithRelations
} from '../../material-picking-order-types';
import { ItemsFieldArray } from './field-form-items-array';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import { IMaintenanceRequestBalanceWithRelations } from '../../../../../maintenance/request/maintenance-request-types';
import {
  usePickingOrderForm,
  type IPickingOrderFormApi
} from '@/src/hooks/use-picking-order-form';
import { materialPickingOrderFormSchemaAdd } from './material-picking-order-form-validation';
import { ErrorClientValidationFormCard } from '@/components/form-tanstack/error-client-validation-form-card';
import { FormSuccessDisplayCard } from '@/components/form-tanstack/form-success-display-card';
import {
  CardMaterialRequestLinkDetails,
  IMaterialRequestBalanceWithRelationsForm
} from '../card-material-link-details';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { IMaterialRequestBalanceWithRelations } from '../../../../request/material-request-types';
import { Label } from '@/components/ui/label';
import {
  FormCombobox,
  FormDatePicker,
  FormDropdown,
  FormInputField,
  FormInputTextArea
} from '../../../../../../../components/form-tanstack/form-input-fields';
import { RequestMaintenanceForm } from '../../../withdrawal/_components/form/request-maintenance-form';
import { CardMaintenanceSummary } from '../../../withdrawal/_components/card-maintenance-summary';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../../../../../../../components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../../../../../lib/utils';
import { Calendar } from '../../../../../../../components/ui/calendar';
import { RequestMaterialForm } from './request-material-form';

export function MaterialPickingOrderForm({
  defaultData,
  formActionProp,
  relatedData,
  submitButtonText,
  SubmitButtonIcon,
  initialServerStatePickingOrder = {
    isSubmitSuccessful: false,
    message: ''
  },
  onCancel,
  onClean
}: {
  defaultData: Partial<Record<keyof IMaterialPickingOrderAddForm, any>>;
  formActionProp: (
    prevState: IActionResultForm<
      IMaterialPickingOrderAddForm,
      IMaterialPickingOrderWithRelations
    >,
    data: IMaterialPickingOrderAddForm
  ) => Promise<
    IActionResultForm<
      IMaterialPickingOrderAddForm,
      IMaterialPickingOrderWithRelations
    >
  >;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: IMaterialPickingOrderRelatedData;
  initialServerStatePickingOrder?: IActionResultForm<
    IMaterialPickingOrderAddForm,
    IMaterialPickingOrderWithRelations
  >;
  onCancel?: () => void;
  onClean?: () => void;
}) {
  const [requestSearchType, setRequestSearchType] = useState<
    'material' | 'maintenance' | 'none'
  >('maintenance');

  const [maintenanceRequestData, setMaintenanceRequestData] =
    useState<IMaintenanceRequestBalanceWithRelations | null>(null);

  const [materialRequestData, setMaterialRequestData] =
    useState<IMaterialRequestBalanceWithRelations | null>(null);

  const [materialRequestBalance, setMaterialRequestBalance] =
    useState<IMaterialRequestBalanceWithRelationsForm | null>(null);

  const [linkMaterialRequest, setLinkMaterialRequest] =
    useState<boolean>(false);

  const [
    serverStatePickingOrder,
    formActionPickingOrder,
    isPendingPickingOrder
  ] = useActionState(formActionProp, initialServerStatePickingOrder);

  // Use o hook para obter a instância do formulário, a partir do hook tipei o formulario
  const formPickingOrder: IPickingOrderFormApi = usePickingOrderForm({
    defaultDataPickingOrderForm: {
      ...defaultData
    },
    serverStatePickingOrder: serverStatePickingOrder,
    formSchema: materialPickingOrderFormSchemaAdd,
    formActionPickingOrder: async (value) => await formActionPickingOrder(value)
  });

  const { listUsers, listWorkers } = relatedData;

  const cleanFormAndStates = () => {
    //não dispara mudança da key do componente, mais contido
    formPickingOrder.reset();
    setMaintenanceRequestData(null);
    setMaterialRequestData(null);
    setLinkMaterialRequest(false);
  };

  const handleReset = () => {
    //dispara mudança da key do compomente, faz um novo fecth, renderiza tudo novamente
    formPickingOrder.reset();
    //     setMaintenanceRequestData(null);
    // setMaterialRequestData(null);
    // setLinkMaterialRequest(false);
    // setRequestSearchType('maintenance');
    onClean && onClean();
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  if (
    serverStatePickingOrder?.isSubmitSuccessful &&
    serverStatePickingOrder.responseData
  ) {
    // toast.success(serverStatePickingOrder.message);
    // handleReset();
    return (
      <FormSuccessDisplayCard
        serverState={serverStatePickingOrder}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        messageActions={{
          handleResetForm: 'Realizar nova reserva',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={false}
      />
    );
  }

  const currentSubmitButtonText = submitButtonText || 'Realizar reserva';

  const currentSubmitButtonIcon = (SubmitButtonIcon && (
    <SubmitButtonIcon className='mr-2 h-5 w-5' />
  )) || <FilePlus className='mr-2 h-5 w-5' />;

  return (
    <div className='space-y-6 pb-6'>
      {/* Erros do lado do servidor */}
      <ErrorServerForm serverState={serverStatePickingOrder} />

      {/* Erros lado cliente */}
      <formPickingOrder.Subscribe
        selector={(state) => [state.errors, state.submissionAttempts]}
      >
        {([errors, submissionAttempts]) => {
          if (submissionAttempts === 0 || !errors || !submissionAttempts)
            return null;
          return <ErrorClientValidationFormCard errors={errors} />;
        }}
      </formPickingOrder.Subscribe>

      <RadioGroup
        defaultValue={requestSearchType}
        onValueChange={(value) => {
          cleanFormAndStates();
          setRequestSearchType(value as any);
          if (value === 'maintenance') {
            setLinkMaterialRequest(false);
          } else if (value === 'material') {
            setLinkMaterialRequest(true);
          } else if (value === 'none') {
            setLinkMaterialRequest(false);
          }
        }}
        className='flex gap-4'
      >
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='maintenance' id='maintenance' />
          <Label htmlFor='maintenance'>Requisição de Manutenção</Label>
        </div>
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='material' id='material' />
          <Label htmlFor='material'>Requisição de Material</Label>
        </div>
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='none' id='none' />
          <Label htmlFor='none'>Urgência</Label>
        </div>
      </RadioGroup>

      {/* Formulário para fazer consulta de requisição de manutenção para reserva */}
      {requestSearchType === 'maintenance' && (
        <RequestMaintenanceForm
          // key={formKey}
          setMaintenanceRequestData={setMaintenanceRequestData}
          maintenanceRequestData={maintenanceRequestData}
        />
      )}
      {/* Formulário para fazer consulta de requisição de material para reserva */}
      {requestSearchType === 'material' && (
        <RequestMaterialForm
          // key={formKey}
          setMaintenanceRequestData={setMaintenanceRequestData}
          maintenanceRequestData={maintenanceRequestData}
          setMaterialRequestData={setMaterialRequestData}
          materialRequestData={materialRequestData}
          setFieldValue={formPickingOrder.setFieldValue}
          setMaterialRequestBalance={setMaterialRequestBalance}
          setLinkMaterialRequest={setLinkMaterialRequest}
        />
      )}

      <form
        id='form-pickingorder'
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          formPickingOrder.handleSubmit();
        }}
        onReset={(e) => {
          e.preventDefault();
          handleReset();
        }}
      >
        <div className='space-y-6'>
          {/* Informações extraídas da requisição de manutenção 
          Só renderiza o card se houver dados da requisição
          */}
          {maintenanceRequestData && (
            <CardMaintenanceSummary
              maintenanceRequestData={maintenanceRequestData}
              setFieldValue={formPickingOrder.setFieldValue}
            />
          )}

          {/* PickingOrder Details */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Formulário de Reserva</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 items-start gap-4 md:grid-cols-1'>
                <div className='hidden'>
                  <formPickingOrder.Field
                    name='pickingOrderNumber'
                    children={(field) => (
                      <FormInputField
                        field={field}
                        label={fieldsLabelsPickingOrderForm.pickingOrderNumber}
                        type='hidden'
                        showLabel={false}
                      />
                    )}
                  />
                  {/* <formPickingOrder.Field
              name='maintenanceRequestId'
              children={(field) => (
                <FormInputField
                  field={field}
                  label={
                    fieldsLabelsPickingOrderForm.maintenanceRequestId as string
                  }
                  type='hidden'
                  showLabel={false}
                />
              )}
            /> */}
                  <formPickingOrder.Field
                    name='proccessedByUserId'
                    children={(field) => (
                      <FormInputField
                        field={field}
                        label={
                          fieldsLabelsPickingOrderForm.proccessedByUserId as string
                        }
                        type='hidden'
                        // type='hidden'
                        showLabel={false}
                      />
                    )}
                  />
                </div>
                <div className='space-y-2'>
                  <formPickingOrder.Field
                    name='desiredPickupDate'
                    children={(field) => (
                      <FormDatePicker
                        field={field}
                        label={fieldsLabelsPickingOrderForm.desiredPickupDate}
                        mode='single'
                        placeholder='dd/MM/yyyy'
                        className='mb-4'
                        formatDate='PPPP'
                      />
                    )}
                  />
                </div>
                {/* items-start, alinhar por cima devido aos informativos de erro que podem aparecer em função do valor inserido no campo */}
                <div className='flex flex-col gap-4 md:flex-row md:items-start'>
                  <formPickingOrder.Field
                    name='collectorType'
                    children={(field) => (
                      <FormDropdown
                        field={field}
                        label={
                          fieldsLabelsPickingOrderForm.collectorType as string
                        }
                        placeholder={
                          fieldsLabelsPickingOrderForm.collectorType as string
                        }
                        options={[
                          { value: 'worker', label: 'Profissional' },
                          { value: 'user', label: 'Servidor' },
                          { value: 'other', label: 'Outro' }
                        ]}
                        onValueChange={(value) => field.handleChange(value)}
                        className='w-35'
                      />
                    )}
                  />

                  <div className='flex-1'>
                    <formPickingOrder.Subscribe
                      selector={(state) => state.values.collectorType}
                      children={(collectorType) => (
                        <>
                          <formPickingOrder.Field
                            name='beCollectedByWorkerId'
                            children={(field) => (
                              <FormCombobox
                                className={`${collectorType === 'worker' ? 'block' : 'hidden'}`}
                                key={field.name} // The key is still good practice
                                field={field}
                                label={`Nome do colaborador`}
                                placeholder='Selecione um colaborador'
                                options={
                                  listWorkers?.map((worker) => ({
                                    value: worker.id,
                                    label: worker.name,
                                    secondaryLabel:
                                      worker.workerContracts[0]?.workerSpecialty
                                        ?.name
                                  })) ?? []
                                }
                                onValueChange={(value) =>
                                  field.handleChange(Number(value))
                                }
                              />
                            )}
                          />
                          <formPickingOrder.Field
                            name='beCollectedByUserId'
                            children={(field) => (
                              <FormCombobox
                                className={`${collectorType === 'user' ? 'block' : 'hidden'}`}
                                key={field.name} // The key is still good practice
                                field={field}
                                label={`Nome do servidor`}
                                placeholder='Selecione um servidor'
                                options={
                                  listUsers?.map((user) => ({
                                    value: user.id,
                                    label: user.name
                                  })) ?? []
                                }
                                onValueChange={(value) =>
                                  field.handleChange(Number(value))
                                }
                              />
                            )}
                          />
                          <formPickingOrder.Field
                            name='collectedByOther'
                            children={(field) => (
                              <FormInputField
                                className={`${collectorType === 'other' ? 'block' : 'hidden'}`}
                                field={field}
                                label={
                                  fieldsLabelsPickingOrderForm.collectedByOther
                                }
                                placeholder='Digite o nome completo'
                              />
                            )}
                          />
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
              {/* TODO: Caso não tenha pego a edificação automaticamente, tornar o obrigatório o campo abaixo do Local!! */}
              {requestSearchType === 'none' && (
                <formPickingOrder.Field
                  name='legacy_place'
                  children={(field) => (
                    <FormInputField
                      // className={`${collectorType === 'other' ? 'block' : 'hidden'}`}
                      field={field}
                      label={fieldsLabelsPickingOrderForm.legacy_place}
                      placeholder='Digite o local de destino'
                    />
                  )}
                />
              )}

              <formPickingOrder.Field
                name='notes'
                children={(field) => (
                  <FormInputTextArea field={field} label='Notas' />
                )}
              />
            </CardContent>
          </Card>

          {/* Material Requisition Link */}
          {(materialRequestData ||
            maintenanceRequestData?.materialRequests) && (
            <CardMaterialRequestLinkDetails
              linkMaterialRequest={linkMaterialRequest}
              setLinkMaterialRequest={setLinkMaterialRequest}
              formPickingOrder={formPickingOrder}
              materialRequestDataLinked={
                materialRequestData
                  ? [{ ...materialRequestData }]
                  : maintenanceRequestData?.materialRequests
              }
              setFieldValue={formPickingOrder.setFieldValue}
              materialRequestBalance={materialRequestBalance}
              setMaterialRequestBalance={setMaterialRequestBalance}
            />
          )}

          {/* Global Free Items for PickingOrder */}
          {(requestSearchType === 'none' ||
            (requestSearchType === 'maintenance' &&
              !linkMaterialRequest &&
              maintenanceRequestData)) && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Materiais para Reserva
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <formPickingOrder.Field name='items' mode='array'>
                  {(field) => <ItemsFieldArray field={field} />}
                </formPickingOrder.Field>
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
            <formPickingOrder.Subscribe
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
                    isPendingPickingOrder ||
                    isValidating ||
                    !isTouched
                  }
                >
                  {isPendingPickingOrder || isValidating
                    ? 'Processando...'
                    : currentSubmitButtonIcon}
                  {isPendingPickingOrder || isValidating
                    ? ''
                    : currentSubmitButtonText}
                </Button>
              )}
            </formPickingOrder.Subscribe>
          </div>
        </div>
      </form>
    </div>
  );
}
