'use client';

import { useState, useMemo, useActionState, startTransition, FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MaterialTable } from './material-table';
import { MaterialItemsField } from './material-items-field';
import { CalendarIcon, FilePlus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  FormDropdown,
  FormInputField,
  FormInputTextArea
} from '../../../../../components/form-tanstack/form-input-fields';
import { FormListBox } from '../../../../../components/form-tanstack/form-list-box';
import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { MapPin, Building, User } from 'lucide-react';
import Image from 'next/image';
import { z } from 'zod';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { formatRequestNumber } from '../../../../../lib/form-utils';
import { IMaterialWithdrawalAdd } from '../withdrawal-types';

interface IMaterial {
  id: number;
  code: string;
  description: string;
  unit: string;
  stockQty: number;
  qtyToRemove: number;
}

const requestFormDataSchema = z.object({
  newReq: z
    .string()
    .min(1, 'Requerido')
    .regex(
      /^[0-9]{1,5}$|^[0-9]+[/]{1}[0-9]{4}$/,
      'Formato de requisição não permitido'
    )
});

export interface IMaterialWithdrawalAddServiceUsage
  extends IMaterialWithdrawalAdd {
  items: IMaterial[];
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

interface IRequestDataSearch {
  requestType: string;
  requestProtocolNumber: string;
}

const initialServerStateRequestData: IActionResultForm<IRequestDataSearch> = {
  isSubmitSuccessful: false,
  message: ''
};

const fieldLabelsRequestData: IRequestDataSearch = {
  requestType: 'Tipo de requisição',
  requestProtocolNumber: 'Número da requisição'
};

const defaultDataRequest: IRequestDataSearch = {
  requestType: 'maintenanceRequest',
  requestProtocolNumber: ''
};

export function MaterialWithdrawalForm({
  promiseMaintenanceRequest,
  formActionProp,
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
  // relatedData: any;
  // withdrawalType: string;
}) {
  // Estado referente ao formulário de retirada
  const [serverStateWithdrawal, formActionWithdrawal, isPendingWithdrawal] =
    useActionState(formActionProp, initialServerStateWithdrawal);

  // Estado referente ao formulário de consulta da requisição
  const [serverStateDataSearch, formActionDataSearch, isPendingDataSearch] =
    useActionState(promiseMaintenanceRequest, initialServerStateRequestData);

  const [linkMaterialRequest, setLinkMaterialRequest] = useState(false);
  const [linkedMaterialRequestData, setLinkedMaterialRequestData] =
    useState<any>(null);
  const [
    maintenanceRequestMaterialsSummary,
    setMaintenanceRequestMaterialsSummary
  ] = useState<any>([
    {
      id: 101,
      code: 'MAT-001',
      description: 'Material A',
      unit: 'UN',
      stockQty: 100,
      qtyToRemove: 20, // This would represent quantity moved out
      movementType: 'OUT'
    },
    {
      id: 102,
      code: 'MAT-002',
      description: 'Material B',
      unit: 'KG',
      stockQty: 50,
      qtyToRemove: 5, // This would represent quantity moved out
      movementType: 'OUT'
    }
  ]);

  // Define interface for maintenance request data
  interface IMaintenanceRequestData {
    id?: number;
    description?: string;
    requestedAt?: string;
    sipacUnitRequesting?: {
      nomeUnidade?: string;
      sigla?: string;
    };
    sipacUserLoginRequest?: string;
    facilityComplex?: {
      name?: string;
    };
    space?: {
      name?: string;
    };
    building?: {
      name?: string;
      latitude?: number;
      longitude?: number;
    };
    local?: string;
  }

  const [maintenanceRequestData, setMaintenanceRequestData] =
    useState<IMaintenanceRequestData | null>(null);

  // Função para buscar os dados referente a requisição de manutenção
  const handleRequestMaintenanceData = async (protocolNumber: string) => {
    startTransition(async () => {
      try {
        const response = await promiseMaintenanceRequest(protocolNumber); // Chama a Server Action
        setMaintenanceRequestData(response);
      } catch (error) {
        console.error('Error refreshing data:', error);
        // Lidar com erro
      }
    });
  };

  const getRequestData = (value: IRequestDataSearch) => {
    if (value.requestType === 'maintenanceRequest') {
      const requestNumberFormatted = formatRequestNumber(
        value.requestProtocolNumber
      );
      handleRequestMaintenanceData(requestNumberFormatted);
      return formatRequestNumber(value.requestProtocolNumber);
    } else if (value.requestType === 'materialRequest') {
      return null;
    } else {
      console.error('Invalid request type:', value.requestType);
    }
    return formatRequestNumber(value.requestProtocolNumber);
  };

  //Formulario de consulta de informações da requisição de manutenção ou material
  const formRequest = useForm({
    defaultValues: defaultDataRequest,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverStateDataSearch ?? {}),
      [serverStateDataSearch]
    ),
    onSubmit: ({ value }) => {
      console.log('Form submitted:', value);
      console.log(getRequestData(value));
    }
  });

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
      <form
        id='form-request'
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          formRequest.handleSubmit();
        }}
      >
        <div className='space-y-6'>
          {/* Request number */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Número da Requisição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-end gap-4'>
                <formRequest.Field
                  name='requestType'
                  children={(field: any) => (
                    <FormDropdown
                      field={field}
                      label={fieldLabelsRequestData.requestType}
                      placeholder={fieldLabelsRequestData.requestType}
                      options={[
                        { value: 'maintenanceRequest', label: 'Manutenção' },
                        { value: 'materialRequest', label: 'Material' }
                        // { value: 'emergencyRequest', label: 'Emergencial' }
                      ]}
                      onValueChange={(value) => field.handleChange(value)}
                    />
                  )}
                />
                {/* <SearchInput
                  placeholder='Search for WO by number or person responsible'
                  onSearch={(value) => console.log('WO Search:', value)}
                /> */}
                <formRequest.Field
                  name='requestProtocolNumber'
                  validators={{
                    onBlur: requestFormDataSchema.shape.newReq
                  }}
                >
                  {(field) => (
                    <FormInputField
                      field={field}
                      label={fieldLabelsRequestData.requestProtocolNumber}
                      type='tel'
                      placeholder='Digite o número...'
                      showLabel={true}
                      className='w-38'
                    />
                  )}
                </formRequest.Field>
                <formRequest.Subscribe
                  selector={(state) => [
                    state.canSubmit,
                    state.isTouched,
                    state.isSubmitting
                  ]}
                >
                  {([canSubmit, isTouched, isSubmitting]) => (
                    <Button
                      type='submit'
                      disabled={!canSubmit || isSubmitting || !isTouched}
                    >
                      {isSubmitting ? (
                        'Vefificando...'
                      ) : (
                        <Search className='h-4 w-4' />
                      )}
                    </Button>
                  )}
                </formRequest.Subscribe>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
      <form
        id='form-withdrawal'
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          formWithdrawal.handleSubmit();
        }}
      >
        <div className='space-y-6'>
          <details className='group'>
            <summary className='bg-card text-card-foreground flex cursor-pointer items-center justify-between rounded-lg border p-6 shadow-sm group-open:rounded-b-none group-open:shadow-sm'>
              <h2 className='text-lg font-semibold'>
                Informações: Requisição de Manutenção
              </h2>
              <span className='shrink-0 transition duration-300 group-open:-rotate-180'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </span>
            </summary>

            {/* Informações extraídas da requisição de manutenção */}
            {/* Só renderiza o card se houver dados da requisição */}
            {maintenanceRequestData?.id && (
              <Card className='rounded-t-none shadow-sm'>
                <CardContent className='space-y-6 pt-6'>
                  {/* Seção de Descrição e Data */}
                  <div className='space-y-2'>
                    <Label>Descrição da Solicitação</Label>
                    <p className='text-muted-foreground text-sm'>
                      {maintenanceRequestData.description ||
                        'Nenhuma descrição fornecida.'}
                    </p>
                  </div>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label>Data da Solicitação</Label>
                      <p className='text-muted-foreground'>
                        {maintenanceRequestData.requestedAt
                          ? format(
                              new Date(maintenanceRequestData.requestedAt),
                              'dd/MM/yyyy HH:mm'
                            )
                          : 'Não informada'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label>Solicitante</Label>
                      <p className='text-muted-foreground'>
                        {/* Combina a unidade com o login do usuário para uma informação completa */}
                        {`${maintenanceRequestData?.sipacUnitRequesting?.nomeUnidade || 'Unidade não informada'} (${maintenanceRequestData?.sipacUserLoginRequest || 'usuário desconhecido'})`}
                      </p>
                    </div>
                  </div>

                  {/* Seção de Localização */}
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label>Complexo</Label>
                      <p className='text-muted-foreground'>
                        {maintenanceRequestData?.facilityComplex?.name ??
                          'Não informado'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label>Edificação / Local Específico</Label>
                      <p className='text-muted-foreground'>
                        {/* Prioriza o espaço, depois a edificação, e por último o campo 'local' */}
                        {maintenanceRequestData?.space?.name ??
                          maintenanceRequestData?.building?.name ??
                          maintenanceRequestData?.local ??
                          'Não especificado'}
                      </p>
                    </div>
                  </div>

                  {/* Seção Visual (Imagem e Mapa) */}
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label>Imagem do Local (Referência)</Label>
                      <div className='overflow-hidden rounded-lg border'>
                        {/* A imagem continua sendo um placeholder, mas o alt text é dinâmico */}
                        <Image
                          src='/images/warehouse-building.png'
                          alt={
                            maintenanceRequestData?.building?.name ??
                            'Imagem do local de destino'
                          }
                          width={300}
                          height={200}
                          className='h-32 w-full object-cover'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label>Mapa de Localização</Label>
                      {/* O link do mapa agora é dinâmico, baseado na latitude e longitude */}
                      <a
                        href={
                          maintenanceRequestData?.building?.latitude &&
                          maintenanceRequestData?.building?.longitude
                            ? `https://www.google.com/maps?q=${maintenanceRequestData.building.latitude},${maintenanceRequestData.building.longitude}`
                            : '#'
                        }
                        target='_blank'
                        rel='noopener noreferrer'
                        className={`flex h-32 items-center justify-center overflow-hidden rounded-lg border ${
                          maintenanceRequestData?.building?.latitude
                            ? 'hover:border-primary'
                            : 'cursor-not-allowed'
                        }`}
                      >
                        <div className='text-center'>
                          <MapPin className='text-accent mx-auto mb-2 h-8 w-8' />
                          <p className='text-accent text-sm'>
                            {maintenanceRequestData?.building?.latitude
                              ? 'Ver Mapa Interativo'
                              : 'Localização Indisponível'}
                          </p>
                          <p className='text-accent/80 text-xs'>
                            {maintenanceRequestData?.building?.latitude
                              ? 'Clique para abrir no mapa'
                              : 'Coordenadas não fornecidas'}
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Seção de Badges de Resumo */}
                  <div className='flex flex-wrap gap-2'>
                    {maintenanceRequestData?.facilityComplex?.name && (
                      <Badge
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        <Building className='h-3 w-3' />
                        {maintenanceRequestData.facilityComplex.name}
                      </Badge>
                    )}
                    {maintenanceRequestData?.building?.name && (
                      <Badge
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        <MapPin className='h-3 w-3' />
                        {maintenanceRequestData.building.name}
                      </Badge>
                    )}
                    {maintenanceRequestData?.sipacUnitRequesting?.sigla && (
                      <Badge
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        <User className='h-3 w-3' />
                        {`Solicitante: ${maintenanceRequestData.sipacUnitRequesting.sigla}`}
                      </Badge>
                    )}
                  </div>

                  <h3 className='text-md font-semibold'>
                    Resumo da Movimentação de Materiais
                  </h3>
                  {/* A tabela de materiais permanece, aguardando os dados corretos */}
                  {/* <MaterialTable
        materials={maintenanceRequestMaterialsSummary}
        onRemove={() => {}} 
        onUpdateQuantity={() => {}}
        readOnly={true}
      /> */}
                </CardContent>
              </Card>
            )}
          </details>
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
          {/* <Card>
            <CardHeader>
              <CardTitle className='text-lg'>
                Link to a Material Requisition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchInput
                placeholder='Search for Requisition by number or cost center'
                onSearch={(value) => console.log('Requisition Search:', value)}
              />
            </CardContent>
          </Card> */}
          {/* Material Requisition Link */}
          <details className='group' open={linkMaterialRequest}>
            <summary className='bg-card text-card-foreground flex cursor-pointer items-center justify-between rounded-lg border p-6 shadow-sm group-open:rounded-b-none group-open:shadow-sm'>
              <div className='flex items-center gap-2'>
                <h2 className='text-lg font-semibold'>
                  Vincular Requisição de Material
                </h2>
                <Switch
                  checked={linkMaterialRequest}
                  onCheckedChange={setLinkMaterialRequest}
                  aria-label='Vincular Requisição de Material'
                />
              </div>
            </summary>
            <Card className='rounded-t-none shadow-sm'>
              <CardContent className='space-y-4'>
                {linkMaterialRequest && (
                  <>
                    <formWithdrawal.Field
                      name='materialRequestId'
                      children={(field) => (
                        <FormListBox
                          field={field}
                          label='Requisições de Material Disponíveis'
                          options={[
                            {
                              value: '1',
                              label: 'Requisição 16349/2025 - Manutenção'
                            },
                            {
                              value: '2',
                              label: 'Requisição 12345/2024 - TI'
                            },
                            {
                              value: '3',
                              label: 'Requisição 20001/2025 - Elétrica'
                            },
                            {
                              value: '4',
                              label: 'Requisição 20002/2025 - Hidráulica'
                            },
                            {
                              value: '5',
                              label: 'Requisição 20003/2025 - Civil'
                            },
                            {
                              value: '6',
                              label: 'Requisição 20004/2025 - Mecânica'
                            },
                            {
                              value: '7',
                              label: 'Requisição 20005/2025 - Limpeza'
                            },
                            {
                              value: '8',
                              label: 'Requisição 20006/2025 - Informática'
                            },
                            {
                              value: '9',
                              label: 'Requisição 20007/2025 - Segurança'
                            },
                            {
                              value: '10',
                              label: 'Requisição 20008/2025 - Transporte'
                            }
                          ]}
                          onValueChange={(value) => {
                            // Simulate fetching data based on selected requisition
                            if (value === '1') {
                              setLinkedMaterialRequestData({
                                protocolNumber: '16349/2025',
                                sipacUserLoginRequest: 'eduardo.kennedi',
                                requestValue: '77.97',
                                servedValue: '77.97',
                                currentStatus: 'FULLY_ATTENDED',
                                requestDate: '2025-06-04T00:00:00.000-03:00',
                                itemsBalance: [
                                  {
                                    globalMaterialId: '302400026133',
                                    materialRequestItemId: 247,
                                    quantityRequested: '1',
                                    quantityApproved: '1',
                                    quantityReceivedSum: '0',
                                    quantityWithdrawnSum: '0',
                                    quantityReserved: '0',
                                    quantityRestricted: '0',
                                    quantityFreeBalanceEffective: '0',
                                    quantityFreeBalancePotential: '1'
                                  }
                                ]
                              });
                            } else {
                              setLinkedMaterialRequestData(null);
                            }
                          }}
                        />
                      )}
                    />
                    {linkedMaterialRequestData && (
                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div className='space-y-2'>
                            <Label>Número do Protocolo</Label>
                            <p className='text-muted-foreground'>
                              {linkedMaterialRequestData.protocolNumber}
                            </p>
                          </div>
                          <div className='space-y-2'>
                            <Label>Login do Usuário SIPAC</Label>
                            <p className='text-muted-foreground'>
                              {linkedMaterialRequestData.sipacUserLoginRequest}
                            </p>
                          </div>
                          <div className='space-y-2'>
                            <Label>Valor da Requisição</Label>
                            <p className='text-muted-foreground'>
                              R$ {linkedMaterialRequestData.requestValue}
                            </p>
                          </div>
                          <div className='space-y-2'>
                            <Label>Valor Atendido</Label>
                            <p className='text-muted-foreground'>
                              R$ {linkedMaterialRequestData.servedValue}
                            </p>
                          </div>
                          <div className='space-y-2'>
                            <Label>Status Atual</Label>
                            <p className='text-muted-foreground'>
                              {linkedMaterialRequestData.currentStatus}
                            </p>
                          </div>
                          <div className='space-y-2'>
                            <Label>Data da Requisição</Label>
                            <p className='text-muted-foreground'>
                              {format(
                                new Date(linkedMaterialRequestData.requestDate),
                                'PPP'
                              )}
                            </p>
                          </div>
                        </div>
                        <h3 className='text-md font-semibold'>
                          Itens da Requisição
                        </h3>
                        <MaterialTable
                          materials={linkedMaterialRequestData.itemsBalance.map(
                            (item: any) => ({
                              id: item.materialRequestItemId,
                              code: item.globalMaterialId,
                              description: 'Material Description (Placeholder)', // You might need to fetch this based on globalMaterialId
                              unit: 'UN', // Placeholder
                              stockQty: parseInt(
                                item.quantityFreeBalancePotential
                              ),
                              qtyToRemove: parseInt(item.quantityRequested)
                            })
                          )}
                          onRemove={() => {}} // No remove action for linked items
                          onUpdateQuantity={() => {}} // No quantity update for linked items
                          readOnly={false} // Make quantity editable for linked items
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </details>
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
                  {(field) => <MaterialItemsField field={field} />}
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
