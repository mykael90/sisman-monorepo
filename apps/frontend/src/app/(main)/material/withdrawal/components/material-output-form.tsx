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
import { MaterialTable } from './material-table';
import { SearchInput } from './search-input';
import { CalendarIcon, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  FormDropdown,
  FormInput
} from '../../../../../components/form-tanstack/form-input-fields';
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
      materialRequestId: ''
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

              {/* <form.Field
                name='materialRequestId'
                children={(field) => (
                  <FormDropdown
                    field={field}
                    label='Requisição de Material'
                    placeholder='Selecione uma requisição'
                    options={[
                      { value: '246', label: 'Requisição 246' },
                      { value: '247', label: 'Requisição 247' }
                    ]}
                    onValueChange={(value) =>
                      setMaterialRequest({ id: parseInt(value) })
                    }
                  />
                )}
              /> */}
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
            </CardContent>
          </Card>
        </details>

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

        {/* Output Details */}
        <details className='group'>
          <summary className='bg-card text-card-foreground flex cursor-pointer items-center justify-between rounded-lg border p-6 shadow-sm group-open:rounded-b-none group-open:shadow-sm'>
            <h2 className='text-lg font-semibold'>
              Vincular Requisição de Material
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
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='output-date'>Output Date</Label>
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='priority'>Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder='Select priority' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='low'>Low</SelectItem>
                      <SelectItem value='medium'>Medium</SelectItem>
                      <SelectItem value='high'>High</SelectItem>
                      <SelectItem value='urgent'>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  placeholder='Add any additional notes or comments...'
                  className='min-h-[100px]'
                />
              </div>
            </CardContent>
          </Card>
        </details>
        {/* Items for Output */}
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
      </div>
    </form>
  );
}
