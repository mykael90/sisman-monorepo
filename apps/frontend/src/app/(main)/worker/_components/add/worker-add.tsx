'use client';

import WorkerForm from '../form/worker-form'; // Changed to default import
import {
  workerFormSchemaAdd,
  WorkerFormSchemaAdd
} from '../form/worker-form-validation';
import { addWorker } from '../../worker-actions';
import { useRouter } from 'next/navigation';
import { IWorker, IWorkerAdd, IWorkerRelatedData } from '../../worker-types';
import { IActionResultForm } from '@/types/types-server-actions';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';

export default function WorkerAdd({
  relatedData, // Added relatedData prop
  isInDialog = false
}: {
  relatedData: IWorkerRelatedData; // Defined relatedData prop type
  isInDialog?: boolean;
}) {
  const router = useRouter();

  const defaultData: WorkerFormSchemaAdd = {
    name: '',
    cpf: '',
    email: '',
    phone: '',
    birthdate: ''
  };

  const fieldLabels = {
    name: 'Nome',
    cpf: 'CPF',
    email: 'Email',
    phone: 'Telefone',
    birthdate: 'Data de Nascimento'
  };

  const initialServerState: IActionResultForm<IWorkerAdd, IWorker> = {
    errorsServer: [],
    message: ''
  };

  const redirect = () => {
    router.push('/worker');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      {/* Header */}
      <FormAddHeader
        title='Adicionar Colaborador'
        description='Preencha os campos para adicionar um novo colaborador.'
      />

      {/* Form Section */}
      <WorkerForm
        key={formKey}
        mode='add'
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        formActionProp={addWorker}
        formSchema={workerFormSchemaAdd}
        SubmitButtonIcon={UserPlus}
        submitButtonText='Criar Colaborador'
        fieldLabels={fieldLabels}
        relatedData={relatedData} // Pass relatedData to WorkerForm
        isInDialog={isInDialog}
      />
    </div>
  );
}
