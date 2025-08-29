'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MaterialOperationOutKey,
  materialOperationOutDisplayMap as op
} from '@/mappers/material-operations-mappers';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FieldApi } from '@tanstack/react-form';
import {
  fieldsLabelsWithdrawalForm,
  IMaterialWithdrawalAddForm
} from '../../withdrawal-types';
import { FormDropdown } from '../../../../../../../components/form-tanstack/form-input-fields';

interface TabSelectorProps {
  field: FieldApi<
    Partial<IMaterialWithdrawalAddForm>,
    'movementTypeCode',
    MaterialOperationOutKey,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
}

export function TabSelector({ field }: TabSelectorProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const tabs = [
    { value: op.OUT_SERVICE_USAGE, label: 'Uso Serviço' },
    { value: op.OUT_DISPOSAL_DAMAGE, label: 'Descarte' },
    { value: op.OUT_DONATION, label: 'Doação' },
    { value: op.OUT_EXPIRATION, label: 'Vencimento' },
    { value: op.OUT_TRANSFER, label: 'Transferência' }
  ];

  const handleValueChange = (value: string) => {
    console.log(value);
  };

  if (!field.state.value) return;

  if (isDesktop) {
    console.log(field.state.value);
    return (
      <>
        <Tabs
          value={field.state.value || tabs[0].value}
          onValueChange={(value) =>
            field.handleChange(value as MaterialOperationOutKey)
          }
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-5'>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </>
    );
  }

  return (
    <FormDropdown
      field={field}
      label={fieldsLabelsWithdrawalForm.movementTypeCode}
      placeholder={fieldsLabelsWithdrawalForm.movementTypeCode}
      options={tabs.map((tab) => ({
        value: tab.value,
        label: tab.label
      }))}
      onValueChange={(value) => field.handleChange(value)}
      // className='w-35'
    />
  );
}
