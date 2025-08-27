'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import {
  FormDropdown,
  FormInputField,
  FormInputTextArea
} from '@/components/form-tanstack/form-input-fields';
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
import { IWithdrawalFormApi } from '../../../../../../../../hooks/use-withdrawal-form';
import { fieldsLabelsWithdrawalForm } from '../../../withdrawal-types';
import { IUser } from '../../../../../../user/user-types';
import { FC } from 'react';
import { IWorker } from '../../../../../../worker/worker-types';

export type WithdrawalDetailUsageServiceProps = {
  formWithdrawal: IWithdrawalFormApi;
  listUsers?: IUser[];
  listWorkers?: IWorker[];
};

export function WithdrawalDetailUsageService({
  formWithdrawal,
  listUsers = [],
  listWorkers = []
}: WithdrawalDetailUsageServiceProps) {
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
                  label={fieldsLabelsWithdrawalForm.withdrawalNumber}
                  type='hidden'
                  showLabel={false}
                />
              )}
            />
            <formWithdrawal.Field
              name='movementTypeCode'
              children={(field) => (
                <FormInputField
                  field={field}
                  label={fieldsLabelsWithdrawalForm.movementTypeCode}
                  type='hidden'
                  showLabel={false}
                />
              )}
            />
            {/* <formWithdrawal.Field
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
            /> */}
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
                          format(field.state.value, 'PPP', { locale: ptBR })
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
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </>
              )}
            />
          </div>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
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
              <formWithdrawal.Subscribe
                selector={(state) => state.values.collectorType}
                children={(collectorType) => (
                  <>
                    <formWithdrawal.Field
                      name='collectedByWorkerId'
                      children={(field) => (
                        <FormDropdown
                          className={`${collectorType === 'worker' ? 'block' : 'hidden'}`}
                          key={field.name} // The key is still good practice
                          field={field}
                          label={`Nome do colaborador`}
                          placeholder='Selecione um trabalhador'
                          options={listWorkers.map((worker) => ({
                            value: worker.id,
                            label: worker.name
                          }))}
                          onValueChange={(value) =>
                            field.handleChange(Number(value))
                          }
                        />
                      )}
                    />
                    <formWithdrawal.Field
                      name='collectedByUserId'
                      children={(field) => (
                        <FormDropdown
                          className={`${collectorType === 'user' ? 'block' : 'hidden'}`}
                          key={field.name} // The key is still good practice
                          field={field}
                          label={`Nome do servidor`}
                          placeholder='Selecione um servidor'
                          options={listUsers.map((user) => ({
                            value: user.id,
                            label: user.name
                          }))}
                          onValueChange={(value) =>
                            field.handleChange(Number(value))
                          }
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
