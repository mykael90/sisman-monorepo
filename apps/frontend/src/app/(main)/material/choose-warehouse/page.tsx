'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Warehouse } from 'lucide-react';
import { FormDropdown } from '@/components/form-tanstack/form-input-fields';
import { AnyFieldApi } from '@tanstack/react-form';
import { IWarehouse } from '@/app/(main)/warehouse/warehouse-types';
import { Button } from '@/components/ui/button';

interface ChooseWarehouseClientProps {
  warehouses: IWarehouse[];
}

export default function ChooseWarehouseClient({
  warehouses
}: ChooseWarehouseClientProps) {
  const router = useRouter();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );

  const handleWarehouseChange = (value: string | number) => {
    setSelectedWarehouseId(Number(value));
  };

  const handleConfirmSelection = () => {
    if (selectedWarehouseId) {
      router.push(`/material/withdrawal?warehouseId=${selectedWarehouseId}`);
    } else {
      alert('Por favor, selecione um depósito.');
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='bg-card text-card-foreground w-full max-w-md rounded-lg border p-8 shadow-sm'>
        <div className='mb-6 flex items-center justify-center gap-4'>
          <Warehouse className='text-primary h-8 w-8' />
          <h1 className='text-2xl font-bold'>Escolha seu Depósito</h1>
        </div>
        <p className='text-muted-foreground mb-6 text-center'>
          Para continuar, por favor, selecione o depósito com o qual você deseja
          trabalhar.
        </p>

        <div className='mb-6'>
          <FormDropdown
            field={
              {
                name: 'choosewarehouse',
                state: {
                  value: selectedWarehouseId,
                  meta: {
                    isValid: true,
                    isBlurred: false,
                    errors: [],
                    isValidating: false
                  }
                },
                handleChange: handleWarehouseChange,
                handleBlur: () => {}
              } as unknown as AnyFieldApi
            }
            label='Selecione um Depósito:'
            placeholder='Selecione um depósito'
            options={warehouses.map((warehouse) => ({
              value: warehouse.id,
              label: warehouse.name
            }))}
            onValueChange={handleWarehouseChange}
            className='w-full'
            showLabel={true}
          />
        </div>

        <Button
          onClick={handleConfirmSelection}
          disabled={!selectedWarehouseId}
          className='w-full'
        >
          Confirmar Seleção
        </Button>
      </div>
    </div>
  );
}
