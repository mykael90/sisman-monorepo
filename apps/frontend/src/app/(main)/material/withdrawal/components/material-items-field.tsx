'use client';

import { FC } from 'react';
import { FieldApi } from '@tanstack/react-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MaterialTable } from './material-table';
import { IMaterialWithdrawalAddServiceUsage } from './material-withdrawal-form';

interface IMaterial {
  id: number;
  code: string;
  description: string;
  unit: string;
  stockQty: number;
  qtyToRemove: number;
}

interface MaterialItemsFieldProps {
  field: FieldApi<
    IMaterialWithdrawalAddServiceUsage,
    'items',
    IMaterial[],
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

export const MaterialItemsField: FC<MaterialItemsFieldProps> = ({ field }) => {
  const handleAddMaterial = (material: IMaterial) => {
    field.pushValue({ ...material, id: Date.now() });
  };

  const handleRemoveMaterial = (id: number) => {
    const index = field.state.value.findIndex((m: IMaterial) => m.id === id);
    if (index !== -1) {
      field.removeValue(index);
    }
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    const index = field.state.value.findIndex((m: IMaterial) => m.id === id);
    if (index !== -1) {
      const updatedMaterial = {
        ...field.state.value[index],
        qtyToRemove: quantity
      };
      field.replaceValue(index, updatedMaterial);
    }
  };

  return (
    <>
      <div className='flex gap-2'>
        <Input
          placeholder='Enter the material code or name to add'
          className='flex-1'
        />
        <Button
          type='button'
          onClick={() =>
            handleAddMaterial({
              id: Date.now(),
              code: 'NEW-MAT',
              description: 'New Material',
              unit: 'UN',
              stockQty: 100,
              qtyToRemove: 1
            })
          }
        >
          <Plus className='mr-2 h-4 w-4' />
          Add
        </Button>
      </div>
      <MaterialTable
        materials={field.state.value}
        onRemove={handleRemoveMaterial}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </>
  );
};
