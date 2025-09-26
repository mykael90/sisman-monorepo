'use client';

import { MaintenanceRequestForm } from '../form/maintenance-request-form';
import { addMaintenanceRequest } from '../../maintenance-request-actions';
import { useRouter } from 'next/navigation';
import { IMaintenanceRequestRelatedData } from '../../maintenance-request-types';

interface MaintenanceRequestAddProps {
  relatedData: IMaintenanceRequestRelatedData;
  isInDialog?: boolean;
}

export function MaintenanceRequestAdd({
  relatedData,
  isInDialog = false
}: MaintenanceRequestAddProps) {
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    const result = await addMaintenanceRequest(null, values);
    if (result.isSubmitSuccessful) {
      router.push('/maintenance-request');
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-bold'>Adicionar Requisição de Manutenção</h1>
      <MaintenanceRequestForm
        onSubmit={handleSubmit}
        relatedData={relatedData}
      />
    </div>
  );
}
