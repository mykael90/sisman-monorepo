import React from 'react';
import { WorkerSpecialtyForm } from '../_components/form/worker-specialty-form';

export default function AddWorkerSpecialtyPage() {
  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <WorkerSpecialtyForm initialData={null} />
      </div>
    </div>
  );
}
