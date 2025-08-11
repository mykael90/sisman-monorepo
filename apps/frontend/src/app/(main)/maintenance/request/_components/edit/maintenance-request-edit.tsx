'use client';

import { MaintenanceRequestForm } from '../form/maintenance-request-form';
import { updateMaintenanceRequest } from '../../maintenance-request-actions';
import { useRouter } from 'next/navigation';

export function MaintenanceRequestEdit({ id }: { id: number }) {
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    const result = await updateMaintenanceRequest(null, { ...values, id });
    if (result.isSubmitSuccessful) {
      router.push('/maintenance-request');
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-bold'>Editar Requisição de Manutenção</h1>
      <MaintenanceRequestForm onSubmit={handleSubmit} />
    </div>
  );
}
