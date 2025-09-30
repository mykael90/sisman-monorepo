'use client';

import FormAddHeader from '@/components/form-tanstack/form-add-header';
import WorkerSpecialtyForm from '../form/worker-specialty-form';
import { IWorkerSpecialty, IWorkerSpecialtyAdd } from '../../worker-specialty-types';
import { IActionResultForm } from '@/types/types-server-actions';
import { CirclePlus } from 'lucide-react';
import { addWorkerSpecialty } from '../../worker-specialty-actions';
import { workerSpecialtyFormSchemaAdd } from '../form/worker-specialty-form-validation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function WorkerSpecialtyAdd({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const defaultData: IWorkerSpecialtyAdd = {
    name: '',
    description: ''
  };

  const fieldLabels: Record<keyof IWorkerSpecialtyAdd, string> = {
    name: 'Nome da Especialidade',
    description: 'Descrição'
  };

  const initialServerState: IActionResultForm<IWorkerSpecialtyAdd, IWorkerSpecialty> = {
    errorsServer: [],
    message: ''
  };

  const router = useRouter();

  const redirect = () => {
    router.push('/worker-specialty');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        Icon={CirclePlus}
        title='Nova Especialidade de Colaborador'
        subtitle='Adicionar uma nova especialidade de colaborador ao sistema'
      />

      <WorkerSpecialtyForm
        key={formKey}
        mode='add'
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels as any}
        formActionProp={addWorkerSpecialty}
        formSchema={workerSpecialtyFormSchemaAdd}
        SubmitButtonIcon={CirclePlus}
        submitButtonText='Criar Especialidade'
        isInDialog={isInDialog}
      />
    </div>
  );
}
