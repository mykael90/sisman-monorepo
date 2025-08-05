'use client';

import { useRouter } from 'next/navigation';
import { updateWarehouse } from '../../warehouse-actions';
import WarehouseForm from '../form/warehouse-form';
import { IWarehouseEdit } from '../../warehouse-types';

interface WarehouseEditProps {
  warehouse: IWarehouseEdit;
}

export function WarehouseEdit({ warehouse }: WarehouseEditProps) {
  const router = useRouter();

  const handleCancel = () => {
    router.push('/warehouse');
  };

  return (
    <div className='mx-auto max-w-3xl'>
      <WarehouseForm
        mode='edit'
        defaultData={warehouse}
        formActionProp={async (_, data) => {
          return await updateWarehouse(_, data);
        }}
        onCancel={handleCancel}
      />
    </div>
  );
}
