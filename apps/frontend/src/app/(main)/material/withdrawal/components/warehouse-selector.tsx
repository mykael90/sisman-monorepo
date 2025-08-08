'use client';

import { useState } from 'react';
import { Warehouse } from 'lucide-react'; // Import Warehouse icon
import { FormDropdown } from '@/components/form-tanstack/form-input-fields';
import { AnyFieldApi } from '@tanstack/react-form';

export function WarehouseSelector() {
  const [currentWarehouse, setCurrentWarehouse] = useState('head-office-sp');

  return (
    <div className='flex items-center gap-2'>
      <Warehouse className='h-5 w-5' />
      <span className='text-sm'>Depósito Atual:</span>
      <FormDropdown
        field={
          {
            name: 'currentWarehouse',
            state: {
              value: currentWarehouse,
              meta: {
                isValid: true,
                isBlurred: false,
                errors: [],
                isValidating: false
              }
            },
            handleChange: (value: string) => setCurrentWarehouse(value),
            handleBlur: () => {}
          } as unknown as AnyFieldApi
        }
        label='Depósito Atual:'
        placeholder='Selecione um depósito'
        options={[
          { value: 'head-office-sp', label: 'Head Office - SP' },
          { value: 'warehouse-rj', label: 'Warehouse - RJ' },
          { value: 'distribution-mg', label: 'Distribution - MG' }
        ]}
        onValueChange={setCurrentWarehouse}
        className='w-48'
        showLabel={false}
      />
    </div>
  );
}
