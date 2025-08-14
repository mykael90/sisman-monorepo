'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import {
  FormDropdown,
  FormInputField,
  FormInputTextArea
} from '@/components/form-tanstack/form-input-fields';
import {
  fieldsLabelsWithdrawalForm,
  IMaterialWithdrawalAddForm
} from '../../components/form/withdrawal-base-form-add';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  FormApi,
  FormAsyncValidateOrFn,
  FormValidateOrFn
} from '@tanstack/react-form';

export function WithdrawalDetailUsageService({
  formWithdrawal
}: {
  formWithdrawal: FormApi<
    IMaterialWithdrawalAddForm,
    FormValidateOrFn<IMaterialWithdrawalAddForm> | undefined,
    FormValidateOrFn<IMaterialWithdrawalAddForm> | undefined,
    FormAsyncValidateOrFn<IMaterialWithdrawalAddForm> | undefined,
    FormValidateOrFn<IMaterialWithdrawalAddForm> | undefined,
    FormAsyncValidateOrFn<IMaterialWithdrawalAddForm> | undefined,
    any,
    any,
    any
  >;
}) {
  return (
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
                  label={fieldsLabelsWithdrawalForm.withdrawalNumber as string}
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
                  label={fieldsLabelsWithdrawalForm.movementTypeId as string}
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
                    fieldsLabelsWithdrawalForm.maintenanceRequestId as string
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
                  label={fieldsLabelsWithdrawalForm.processedByUserId as string}
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
                  label={fieldsLabelsWithdrawalForm.collectorType as string}
                  placeholder={
                    fieldsLabelsWithdrawalForm.collectorType as string
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
                    onValueChange={(value) => field.handleChange(Number(value))}
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
  );
}
