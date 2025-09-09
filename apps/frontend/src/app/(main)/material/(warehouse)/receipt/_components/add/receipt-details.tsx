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
import { IReceiptFormApi } from '@/hooks/use-receipt-form'; // Precisa criar este hook
import { fieldsLabelReceiptForm } from '../../receipt-types';
import { materialOperationInDisplayMap } from '@/mappers/material-operations-mappers';

export type ReceiptDetailsProps = {
  formReceipt: IReceiptFormApi;
};

export function ReceiptDetails({ formReceipt }: ReceiptDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Formulário de Entrada</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 items-start gap-4 md:grid-cols-1'>
          <div className='hidden'>
            <formReceipt.Field
              name='movementTypeCode'
              children={(field) => (
                <FormInputField
                  field={field}
                  label={fieldsLabelReceiptForm.movementTypeCode}
                  type='hidden'
                  showLabel={false}
                />
              )}
            />
            <formReceipt.Field
              name='processedByUserId'
              children={(field) => (
                <FormInputField
                  field={field}
                  label={fieldsLabelReceiptForm.processedByUserId as string}
                  type='hidden'
                  showLabel={false}
                />
              )}
            />
          </div>
          <div className='space-y-2'>
            <formReceipt.Field
              name='receiptDate'
              children={(field) => (
                <>
                  <Label htmlFor='receiptDate'>Data da Entrada</Label>
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
          <formReceipt.Field
            name='sourceName'
            children={(field) => (
              <FormInputField
                field={field}
                label={fieldsLabelReceiptForm.sourceName}
                placeholder='Digite o nome do fornecedor ou doador'
              />
            )}
          />
          <formReceipt.Field
            name='externalReference'
            children={(field) => (
              <FormInputField
                field={field}
                label={fieldsLabelReceiptForm.externalReference}
                placeholder='Digite o documento de entrada (ex: NF-e)'
              />
            )}
          />
        </div>
        <formReceipt.Field
          name='notes'
          children={(field) => (
            <FormInputTextArea field={field} label='Observações' />
          )}
        />
      </CardContent>
    </Card>
  );
}
