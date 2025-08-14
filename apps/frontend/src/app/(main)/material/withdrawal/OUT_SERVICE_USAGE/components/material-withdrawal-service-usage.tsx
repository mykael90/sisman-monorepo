'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { format } from 'date-fns';
import { CalendarIcon, FilePlus } from 'lucide-react';
import { FC, useActionState, useState } from 'react';
import {
  FormDropdown,
  FormInputField,
  FormInputTextArea
} from '../../../../../../components/form-tanstack/form-input-fields';
import { IActionResultForm } from '../../../../../../types/types-server-actions';
import { IMaterialGlobalCatalogAdd } from '../../../material-types';
import {
  IMaterialWithdrawalAdd,
  IMaterialWithdrawalItemAdd,
  IMaterialWithdrawalRelatedData
} from '../../withdrawal-types';
import { CardMaintenanceSummary } from '../../components/card-maintenance-summary';
import { CardMaterialLinkDetails } from '../../components/card-material-link-details';
import { MaterialItemsField } from '../../components/material-items-field';
import {
  IMaintenanceRequestData,
  RequestMaintenanceMaterialForm
} from '../../components/request-maintenance-material-form';
import { IMaterialRequest } from '../../../request/request-types';

//TODO:
export type IMaterialWithdrawalItemAddServiceUsage =
  IMaterialWithdrawalItemAdd &
    Omit<IMaterialGlobalCatalogAdd, 'id'> & { key: number; stockQty: number };

export interface IMaterialWithdrawalAddServiceUsage
  extends IMaterialWithdrawalAdd {
  items: IMaterialWithdrawalItemAdd[];
  collectorType: string;
}

const defaultDataWithdrawalServiceUsage: IMaterialWithdrawalAddServiceUsage = {
  withdrawalNumber: '',
  withdrawalDate: new Date(),
  maintenanceRequestId: undefined,
  warehouseId: 1,
  processedByUserId: 1,
  collectedByWorkerId: undefined,
  movementTypeId: 1,
  items: [],
  materialRequestId: undefined,
  notes: '',
  collectorType: 'worker'
};

const fieldsLabelsWithdrawalServiceUsage: Partial<
  Record<keyof IMaterialWithdrawalAddServiceUsage, string>
> = {
  collectedByUserId: 'Coletado pelo usuário',
  withdrawalNumber: 'Número da Retirada',
  withdrawalDate: 'Data da Retirada',
  maintenanceRequestId: 'Requisição de Manutenção',
  warehouseId: 'Depósito',
  processedByUserId: 'Processado por',
  movementTypeId: 'Tipo de Movimento',
  materialRequestId: 'Requisição de Material',
  notes: 'Observações',
  collectorType: 'Coletado por'
};

const initialServerStateWithdrawal: IActionResultForm<IMaterialWithdrawalAddServiceUsage> =
  {
    isSubmitSuccessful: false,
    message: ''
  };

export function MaterialWithdrawalServiceUsage({
  promiseMaintenanceRequest,
  formActionProp,
  relatedData,
  // onCancel,
  // onClean,
  submitButtonText,
  SubmitButtonIcon
  // relatedData
  // withdrawalType
}: {
  promiseMaintenanceRequest: any;
  formActionProp: any;
  // onCancel?: () => void;
  // onClean?: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: IMaterialWithdrawalRelatedData;
  // relatedData: any;
  // withdrawalType: string;
}) {
  const { listGlobalMaterials, listUsers } = relatedData;

  const [maintenanceRequestData, setMaintenanceRequestData] =
    useState<IMaintenanceRequestData | null>(null);

  const [materialRequestData, setMaterialRequestData] =
    useState<IMaterialRequest | null>(null);

  const [linkMaterialRequest, setLinkMaterialRequest] = useState(false);
  const [materialRequestDataLinked, setMaterialRequestDataLinked] =
    useState<any>(null);

  // Estado referente ao formulário de retirada
  const [serverStateWithdrawal, formActionWithdrawal, isPendingWithdrawal] =
    useActionState(formActionProp, initialServerStateWithdrawal);

  //Formulário para inserir nova retirada de materiais
  const formWithdrawal = useForm({
    defaultValues: defaultDataWithdrawalServiceUsage,
    transform: useTransform(
      (baseform) => mergeForm(baseform, serverStateWithdrawal ?? {}),
      [serverStateWithdrawal]
    ),
    onSubmit: (values) => {
      console.log('Form submitted:', values);
    }
  });

  const currentSubmitButtonText = submitButtonText || 'Realizar retirada';

  const CurrentSubmitButtonIcon = (SubmitButtonIcon && (
    <SubmitButtonIcon className='mr-2 h-5 w-5' />
  )) || <FilePlus className='mr-2 h-5 w-5' />;

  return (
    <div className='space-y-6'>
      {/* {JSON.stringify(maintenanceRequestData, null, 2)} */}
      {/* {JSON.stringify(listUsers, null, 2)} */}
      <RequestMaintenanceMaterialForm
        promiseMaintenanceRequest={promiseMaintenanceRequest}
        setMaintenanceRequestData={setMaintenanceRequestData}
      />
      <form
        id='form-withdrawal'
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          formWithdrawal.handleSubmit();
        }}
      >
        <div className='space-y-6'>
          {/* Informações extraídas da requisição de manutenção 
          Só renderiza o card se houver dados da requisição
          */}
          {maintenanceRequestData?.id && (
            <CardMaintenanceSummary
              maintenanceRequestData={maintenanceRequestData}
            />
          )}
          {/* Withdrawal Details */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Formulário de Retirada</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='hidden'>
                  <formWithdrawal.Field
                    name='withdrawalNumber'
                    children={(field) => (
                      <FormInputField
                        field={field}
                        label={
                          fieldsLabelsWithdrawalServiceUsage.withdrawalNumber as string
                        }
                        type='hidden'
                        showLabel={false}
                      />
                    )}
                  />
                  <formWithdrawal.Field
                    name='movementTypeId'
                    children={(field) => (
                      <FormInputField
                        field={field}
                        label={
                          fieldsLabelsWithdrawalServiceUsage.movementTypeId as string
                        }
                        type='hidden'
                        showLabel={false}
                      />
                    )}
                  />
                  <formWithdrawal.Field
                    name='maintenanceRequestId'
                    children={(field) => (
                      <FormInputField
                        field={field}
                        label={
                          fieldsLabelsWithdrawalServiceUsage.maintenanceRequestId as string
                        }
                        type='hidden'
                        showLabel={false}
                      />
                    )}
                  />
                  <formWithdrawal.Field
                    name='processedByUserId'
                    children={(field) => (
                      <FormInputField
                        field={field}
                        label={
                          fieldsLabelsWithdrawalServiceUsage.processedByUserId as string
                        }
                        type='hidden'
                        // type='hidden'
                        showLabel={false}
                      />
                    )}
                  />
                </div>
                <div className='space-y-2'>
                  <formWithdrawal.Field
                    name='withdrawalDate'
                    children={(field) => (
                      <>
                        <Label htmlFor='withdrawalDate'>Data da Retirada</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !field.state.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className='mr-2 h-4 w-4' />
                              {field.state.value ? (
                                format(field.state.value, 'PPP')
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0'>
                            <Calendar
                              mode='single'
                              selected={
                                field.state.value
                                  ? new Date(field.state.value)
                                  : undefined
                              }
                              onSelect={(date) => date && field.setValue(date)}
                            />
                          </PopoverContent>
                        </Popover>
                      </>
                    )}
                  />
                </div>
                <div className='flex items-center gap-4'>
                  <formWithdrawal.Field
                    name='collectorType'
                    children={(field) => (
                      <FormDropdown
                        field={field}
                        label={
                          fieldsLabelsWithdrawalServiceUsage.collectorType as string
                        }
                        placeholder={
                          fieldsLabelsWithdrawalServiceUsage.collectorType as string
                        }
                        options={[
                          { value: 'worker', label: 'Profissional' },
                          { value: 'user', label: 'Servidor' }
                        ]}
                        onValueChange={(value) => field.handleChange(value)}
                        className='w-35'
                      />
                    )}
                  />

                  <div className='flex-1'>
                    <formWithdrawal.Field
                      name='collectedByWorkerId'
                      children={(field) => (
                        // <formWithdrawal.Subscribe
                        //   selector={(state) => state.values.collectorType}
                        // >
                        //   {(collectorType) => (
                        <FormDropdown
                          key={field.name} // The key is still good practice
                          field={field}
                          label={`Nome do colaborador`}
                          placeholder='Selecione um trabalhador'
                          options={[
                            { value: '1', label: 'Trabalhador 1' },
                            { value: '2', label: 'Trabalhador 2' }
                          ]}
                          onValueChange={(value) =>
                            field.handleChange(Number(value))
                          }
                        />
                        // )}
                        // </formWithdrawal.Subscribe>
                      )}
                    />
                  </div>
                </div>
              </div>
              {/* TODO: Caso não tenha pego a edificação automaticamente, tornar o obrigatório o campo abaixo do Local!! */}
              <formWithdrawal.Field
                name='notes'
                children={(field) => (
                  <FormInputTextArea field={field} label='Notas' />
                )}
              />
            </CardContent>
          </Card>

          {/* Material Requisition Link */}
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
                    <MaterialItemsField
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
          <Button
            type='button'
            variant='outline'
            onClick={() => formWithdrawal.reset()}
          >
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
                  isPendingWithdrawal || // from useActionState
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
