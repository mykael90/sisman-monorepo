import React from 'react';
import { WorkerSpecialtyForm } from '../../_components/form/worker-specialty-form';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { showWorkerSpecialty } from '../../worker-specialty-actions';

interface EditWorkerSpecialtyPageProps {
  params: {
    id: string;
  };
}

export default async function EditWorkerSpecialtyPage({
  params
}: EditWorkerSpecialtyPageProps) {
  const accessTokenSisman = await getSismanAccessToken();
  const workerSpecialty = await showWorkerSpecialty(
    Number(params.id),
    accessTokenSisman
  );

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <WorkerSpecialtyForm initialData={workerSpecialty} />
      </div>
    </div>
  );
}
