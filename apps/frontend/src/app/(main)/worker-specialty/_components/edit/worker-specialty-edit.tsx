'use client';

import { useRouter } from 'next/navigation';
import FormAddHeader from '@/components/form-tanstack/form-add-header';
import WorkerSpecialtyForm from '../form/worker-specialty-form';
import { IWorkerSpecialty, IWorkerSpecialtyEdit } from '../../worker-specialty-types';
import { IActionResultForm } from '@/types/types-server-actions';
import { Save, CircleUserRound } from 'lucide-react';
import { updateWorkerSpecialty } from '../../worker-specialty-actions';
import { workerSpecialtyFormSchemaEdit } from '../form/worker-specialty-form-validation';
import { removeUnreferencedKeys } from '@/lib/form-utils';

export default function WorkerSpecialtyEdit({
  initialWorkerSpecialty,
  isInDialog = false
}: {
  initialWorkerSpecialty: IWorkerSpecialtyEdit;
  isInDialog?: boolean;
}) {
  const fieldLabels: Record<keyof IWorkerSpecialtyEdit, string> = {
    id: 'ID',
    name: 'Nome da Especialidade',
    description: 'Descrição'
  };

  const defaultData: IWorkerSpecialtyEdit = removeUnreferencedKeys(
    initialWorkerSpecialty,
    fieldLabels
  );

  const initialServerState: IActionResultForm<IWorkerSpecialtyEdit, IWorkerSpecialty> = {
    errorsServer: [],
    message: ''
  };

  const router = useRouter();

  const redirect = () => {
    router.push('/worker-specialty');
  };

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        Icon={CircleUserRound}
        title='Atualizar Especialidade de Colaborador'
        subtitle='Atualizar informações de uma especialidade de colaborador no sistema'
      />

      <WorkerSpecialtyForm
        mode='edit'
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels as any}
        formActionProp={updateWorkerSpecialty}
        formSchema={workerSpecialtyFormSchemaEdit}
        SubmitButtonIcon={Save}
        submitButtonText='Salvar'
        isInDialog={isInDialog}
      />
    </div>
  );
}
