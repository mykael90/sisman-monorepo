'use client';

import WorkerManualFrequencyForm from '../form/worker-manual-frequency-form';
import { workerManualFrequencyFormSchemaAdd } from '../form/worker-manual-frequency-form-validation';
import { addWorkerManualFrequency } from '../../worker-manual-frequency-actions';
import { useRouter } from 'next/navigation';
import {
  IWorkerManualFrequency,
  IWorkerManualFrequencyAdd,
  IWorkerManualFrequencyRelatedData
} from '../../worker-manual-frequency-types';
import { IActionResultForm } from '@/types/types-server-actions';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function WorkerManualFrequencyAdd({
  relatedData,
  isInDialog = false
}: {
  relatedData: IWorkerManualFrequencyRelatedData;
  isInDialog?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const defaultData: IWorkerManualFrequencyAdd = {
    date: new Date(),
    workerId: '',
    workerManualFrequencyTypeId: '',
    // userId: session?.user?.id || '',
    userId: 1,
    hours: '9',
    notes: ''
  };

  const fieldLabels = {
    date: 'Data',
    workerId: 'Colaborador',
    workerManualFrequencyTypeId: 'Tipo de Frequência',
    userId: 'Usuário',
    hours: 'Horas',
    notes: 'Notas'
  };

  const initialServerState: IActionResultForm<
    IWorkerManualFrequencyAdd,
    IWorkerManualFrequency
  > = {
    errorsServer: [],
    message: ''
  };

  const redirect = () => {
    router.push('/worker-manual-frequency');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        title='Adicionar Frequência Manual'
        description='Preencha os campos para adicionar uma nova frequência manual.'
      />

      <WorkerManualFrequencyForm
        key={formKey}
        mode='add'
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        formActionProp={addWorkerManualFrequency}
        formSchema={workerManualFrequencyFormSchemaAdd}
        SubmitButtonIcon={CalendarPlus}
        submitButtonText='Criar Frequência'
        fieldLabels={fieldLabels}
        relatedData={relatedData}
        isInDialog={isInDialog}
      />
    </div>
  );
}
