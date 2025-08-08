'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MaterialTable } from './material-table';
import { SearchInput } from './search-input';
import { CalendarIcon, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  FormDropdown,
  FormInput
} from '../../../../../components/form-tanstack/form-input-fields';
import { FormListBox } from '../../../../../components/form-tanstack/form-list-box';
import { AnyFieldApi, useField, useForm } from '@tanstack/react-form';
import { MapPin, Building, User } from 'lucide-react';
import Image from 'next/image';

interface MaterialOutputFormProps {
  outputType: string;
}

export function MaterialOutputForm({ outputType }: MaterialOutputFormProps) {
  const [withdrawalDate, setWithdrawalDate] = useState<Date>(new Date());
  const [maintenanceRequest, setMaintenanceRequest] = useState<any>(null);
  const [warehouse, setWarehouse] = useState<any>(null);
  const [processedByUser, setProcessedByUser] = useState<any>(null);
  const [collectedByWorker, setCollectedByWorker] = useState<any>(null);
  const [materialRequest, setMaterialRequest] = useState<any>(null);
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

  const [materials, setMaterials] = useState([
    {
      id: 1,
      code: 'PAR-001',
      description: 'M8 Hex Bolt',
      unit: 'UN',
      stockQty: 250,
      qtyToRemove: 50
    },
    {
      id: 2,
      code: 'ELE-045',
      description: 'Electrical Wire 2.5mm',
      unit: 'M',
      stockQty: 15,
      qtyToRemove: 10
    }
  ]);
  const [requestType, setRequestType] = useState('maintenanceRequest');
  const [collectorType, setCollectorType] = useState('worker');

  const form = useForm({
    defaultValues: {
      withdrawalNumber: 'RET-007',
      withdrawalDate: new Date(),
      maintenanceRequestId: '',
      warehouseId: '',
      processedByUserId: '',
      collectedByWorkerId: '',
      movementTypeCode: 'OUT_SERVICE_USAGE',
      items: [],
      materialRequestId: '',
      notes: ''
    },
    onSubmit: (values) => {
      console.log('Form submitted:', values);
    }
  });

  const handleAddMaterial = (material: any) => {
    setMaterials([...materials, { ...material, id: Date.now() }]);
  };

  const handleRemoveMaterial = (id: number) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setMaterials(
      materials.map((m) => (m.id === id ? { ...m, qtyToRemove: quantity } : m))
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className='space-y-6'>
        {/* Service Order Link */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Número da Requisição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-4'>
              <FormDropdown
                field={
                  {
                    name: 'requestType',
                    state: {
                      value: requestType,
                      meta: {
                        isValid: true,
                        isBlurred: false,
                        errors: [],
                        isValidating: false
                      }
                    },
                    handleChange: (value: string) => setRequestType(value),
                    handleBlur: () => {}
                  } as unknown as AnyFieldApi
                }
                label='Tipo de Requisição:'
                placeholder='Selecione um depósito'
                options={[
                  { value: 'maintenanceRequest', label: 'Manutenção' },
                  { value: 'materialRequest', label: 'Material' }
                  // { value: 'emergencyRequest', label: 'Emergencial' }
                ]}
                onValueChange={setRequestType}
                className='w-35'
                showLabel={false}
              />
              <SearchInput
                placeholder='Search for WO by number or person responsible'
                onSearch={(value) => console.log('WO Search:', value)}
              />
            </div>
          </CardContent>
        </Card>

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
          <Card className='rounded-t-none shadow-sm'>
            <CardContent className='space-y-6'>
              <form.Field
                name='maintenanceRequestId'
                children={(field) => (
                  <FormDropdown
                    field={field}
                    label='Requisição de Manutenção'
                    placeholder='Selecione uma requisição'
                    options={[
                      { value: '79', label: 'Requisição 79' },
                      { value: '80', label: 'Requisição 80' }
                    ]}
                    onValueChange={(value) =>
                      setMaintenanceRequest({ id: parseInt(value) })
                    }
                  />
                )}
              />
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Destination Location</Label>
                  <p className='text-muted-foreground'>
                    Engineering Building - Block A
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label>Specific Area</Label>
                  <p className='text-muted-foreground'>
                    3rd Floor - Elevator Shaft 02
                  </p>
                </div>
              </div>
              <div className='space-y-2'>
                <Label>Recipient</Label>
                <p className='text-muted-foreground'>
                  João da Silva - Maintenance Team
                </p>
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Destination Image</Label>
                  <div className='overflow-hidden rounded-lg border'>
                    <Image
                      src='/images/warehouse-building.png'
                      alt='Engineering Building - Block A'
                      width={300}
                      height={200}
                      className='h-32 w-full object-cover'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Location Map</Label>
                  <div className='bg-accent/10 flex h-32 items-center justify-center overflow-hidden rounded-lg border'>
                    <div className='text-center'>
                      <MapPin className='text-accent mx-auto mb-2 h-8 w-8' />
                      <p className='text-accent text-sm'>Interactive Map</p>
                      <p className='text-accent/80 text-xs'>
                        Click to view detailed location
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <Building className='h-3 w-3' />
                  Engineering Building
                </Badge>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <MapPin className='h-3 w-3' />
                  Block A - 3rd Floor
                </Badge>
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <User className='h-3 w-3' />
                  João da Silva
                </Badge>
              </div>

              <h3 className='text-md font-semibold'>
                Resumo da Movimentação de Materiais
              </h3>
              <MaterialTable
                materials={maintenanceRequestMaterialsSummary}
                onRemove={() => {}} // No remove action for summary items
                onUpdateQuantity={() => {}} // No quantity update for summary items
                readOnly={true} // This table should be read-only
              />
            </CardContent>
          </Card>
        </details>

        {/* Output Details */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Formulário de Retirada</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='hidden'>
                <form.Field
                  name='withdrawalNumber'
                  children={(field) => (
                    <FormInput
                      field={field}
                      label='Número da Retirada'
                      type='hidden'
                      showLabel={false}
                    />
                  )}
                />
                <form.Field
                  name='movementTypeCode'
                  children={(field) => (
                    <FormInput
                      field={field}
                      label='Tipo de Movimento'
                      type='hidden'
                      showLabel={false}
                    />
                  )}
                />
                <form.Field
                  name='maintenanceRequestId'
                  children={(field) => (
                    <FormInput
                      field={field}
                      label='ID da Requisição de Manutenção'
                      type='hidden'
                      showLabel={false}
                    />
                  )}
                />
                <form.Field
                  name='processedByUserId'
                  children={(field) => (
                    <FormInput
                      field={field}
                      label='Processado por'
                      type='hidden'
                      // type='hidden'
                      showLabel={false}
                    />
                  )}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='withdrawalDate'>Data da Retirada</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !withdrawalDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {withdrawalDate ? (
                        format(withdrawalDate, 'PPP')
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={withdrawalDate}
                      onSelect={(date) => date && setWithdrawalDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='flex items-center gap-4'>
                <FormDropdown
                  field={
                    {
                      name: 'collectorType',
                      state: {
                        value: collectorType,
                        meta: {
                          isValid: true,
                          isBlurred: false,
                          errors: [],
                          isValidating: false
                        }
                      },
                      handleChange: (value: string) => setCollectorType(value),
                      handleBlur: () => {}
                    } as unknown as AnyFieldApi
                  }
                  label='Coletado por'
                  placeholder='Escolha o tipo'
                  options={[
                    { value: 'worker', label: 'Profissional' },
                    { value: 'user', label: 'Servidor' }
                    // { value: 'emergencyRequest', label: 'Emergencial' }
                  ]}
                  onValueChange={setCollectorType}
                  className='w-35'
                  showLabel={true}
                />
                <div className='flex-1'>
                  <form.Field
                    name='collectedByWorkerId'
                    children={(field) => (
                      <FormDropdown
                        field={field}
                        label={`Nome do ${collectorType === 'worker' ? 'profissional' : 'servidor'}`}
                        placeholder='Selecione um trabalhador'
                        options={[
                          { value: '1', label: 'Trabalhador 1' },
                          { value: '2', label: 'Trabalhador 2' }
                        ]}
                        onValueChange={(value) =>
                          setCollectedByWorker({ id: parseInt(value) })
                        }
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* TODO: Caso não tenha pego a edificação automaticamente, tornar o obrigatório o campo abaixo do Local!! */}

            <form.Field
              name='notes'
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor='notes'>Observações</Label>
                  <Textarea
                    id='notes'
                    placeholder='Add any additional notes or comments...'
                    className='min-h-[100px]'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
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
                  <form.Field
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
                          { value: '2', label: 'Requisição 12345/2024 - TI' },
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
                          setMaterialRequest({ id: parseInt(value) });
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
                        onUpdateQuantity={handleUpdateQuantity} // Allow quantity update for linked items
                        readOnly={false} // Make quantity editable for linked items
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </details>
        {/* Items for Output */}
        {!linkMaterialRequest && (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Materiais para Retirada</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  placeholder='Enter the material code or name to add'
                  className='flex-1'
                />
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Add
                </Button>
              </div>

              <MaterialTable
                materials={materials}
                onRemove={handleRemoveMaterial}
                onUpdateQuantity={handleUpdateQuantity}
              />

              <div className='flex justify-end gap-2 pt-4'>
                <Button variant='outline'>Cancel</Button>
                <Button className='bg-accent hover:bg-accent/90'>
                  Check Out
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </form>
  );
}
