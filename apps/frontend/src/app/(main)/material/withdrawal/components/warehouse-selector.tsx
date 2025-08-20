'use client';

import { Warehouse } from 'lucide-react'; // Import Warehouse icon
import { FormDropdown } from '@/components/form-tanstack/form-input-fields';
import { AnyFieldApi } from '@tanstack/react-form';
import { useWarehouseContext } from '../context/warehouse-provider';

export function WarehouseSelector() {
  const { warehouseId, setWarehouseId } = useWarehouseContext();

  return (
    <div className='flex items-center gap-2'>
      <Warehouse className='h-5 w-5' />
      <span className='text-sm'>Depósito Atual:</span>
      <FormDropdown
        field={
          {
            name: 'currentWarehouse',
            state: {
              value: warehouseId,
              meta: {
                isValid: true,
                isBlurred: false,
                errors: [],
                isValidating: false
              }
            },
            handleChange: (value: string | number) =>
              setWarehouseId(Number(value)),
            handleBlur: () => {}
          } as unknown as AnyFieldApi
        }
        label='Depósito Atual:'
        placeholder='Selecione um depósito'
        options={[
          { value: 100, label: 'Head Office - SP' },
          { value: 101, label: 'Warehouse - RJ' },
          { value: 102, label: 'Distribution - MG' }
        ]}
        onValueChange={(value) => setWarehouseId(Number(value))}
        className='w-48'
        showLabel={false}
      />
    </div>
  );
}
