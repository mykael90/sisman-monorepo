'use client';

import { workerManualFrequencyFormSchemaAddBulk } from '../form/worker-manual-frequency-form-validation';
import { addWorkerManualFrequencyMany } from '../../worker-manual-frequency-actions';
import { useRouter } from 'next/navigation';
import {
  IWorkerManualFrequencyAddBulkForm,
  IWorkerManualFrequencyRelatedData
} from '../../worker-manual-frequency-types';
import { IActionResultForm } from '@/types/types-server-actions';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import WorkerManualFrequencyFormBulk from '../form/worker-manual-frequency-form-bulk';

export default function WorkerManualFrequencyAddBulk({
  relatedData,
  isInDialog = false
}: {
  relatedData: IWorkerManualFrequencyRelatedData;
  isInDialog?: boolean;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status !== 'loading' && !session?.user?.idSisman) {
    toast.warning('É preciso está autenticado para acessar essa página.');
    router.push('/signin');
  }

  const defaultData: IWorkerManualFrequencyAddBulkForm = {
    date: new Date(),
    workerId: '',
    workerManualFrequencyTypeId: 1,
    // userId: session?.user?.id || '',
    userId: session?.user?.idSisman as number,
    hours: '9',
    notes: '',
    workerContractId: '',
    items: []
  };

  const fieldLabels = {
    date: 'Data',
    workerId: 'Colaborador',
    workerManualFrequencyTypeId: 'Tipo de Frequência',
    userId: 'Usuário',
    hours: 'Horas',
    notes: 'Notas',
    workerContractId: 'Contrato',
    items: 'Itens'
  };

  const initialServerState: IActionResultForm<
    IWorkerManualFrequencyAddBulkForm,
    { count: number }
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
        title='Adicionar Frequência Manual em Lote'
        description='Preencha os campos para adicionar uma nova frequência manual em lote.'
      />

      <WorkerManualFrequencyFormBulk
        key={formKey}
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        formActionProp={addWorkerManualFrequencyMany}
        formSchema={workerManualFrequencyFormSchemaAddBulk}
        SubmitButtonIcon={CalendarPlus}
        submitButtonText='Confirmar Registros'
        fieldLabels={fieldLabels}
        relatedData={relatedData}
        isInDialog={isInDialog}
      />
    </div>
  );
}
