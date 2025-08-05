'use client';

import { useRouter } from 'next/navigation';
import { addWarehouse } from '../../warehouse-actions';
import WarehouseForm from '../form/warehouse-form';
import { IWarehouseAdd } from '../../warehouse-types';

export function WarehouseAdd() {
  const router = useRouter();

  const handleCancel = () => {
    router.push('/warehouse');
  };

  return (
    <div className='mx-auto max-w-3xl'>
      <WarehouseForm
        mode='add'
        defaultData={{
          name: '',
          code: '',
          location: '',
          isActive: true,
          maintenanceInstanceId: 0
        }}
        formActionProp={async (_, data) => {
          return await addWarehouse(_, data);
        }}
        onCancel={handleCancel}
      />
    </div>
  );
}
