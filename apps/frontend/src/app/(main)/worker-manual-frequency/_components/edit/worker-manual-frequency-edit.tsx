'use client';

import { workerManualFrequencyFormSchemaEdit } from '../form/worker-manual-frequency-form-validation';
import { updateWorkerManualFrequency } from '../../worker-manual-frequency-actions';
import { useRouter } from 'next/navigation';
import {
  IWorkerManualFrequency,
  IWorkerManualFrequencyEdit,
  IWorkerManualFrequencyRelatedData
} from '../../worker-manual-frequency-types';
import { removeUnreferencedKeys } from '../../../../../lib/form-utils';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import WorkerManualFrequencyForm from '../form/worker-manual-frequency-form';
import { Save, CalendarPlus } from 'lucide-react';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import { getDateUTC } from '../../../../../lib/utils';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function WorkerManualFrequencyEdit({
  initialWorkerManualFrequency,
  relatedData,
  isInDialog = false
}: {
  initialWorkerManualFrequency: IWorkerManualFrequency;
  relatedData: IWorkerManualFrequencyRelatedData;
  isInDialog?: boolean;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status !== 'loading' && !session?.user?.idSisman) {
    toast.warning('É preciso está autenticado para acessar essa página.');
    router.push('/signin');
  }

  const userId = session?.user?.idSisman as number;

  const fieldLabels = {
    id: 'Id',
    date: 'Data',
    workerId: 'Colaborador',
    workerManualFrequencyTypeId: 'Tipo de Frequência',
    userId: 'Usuário',
    hours: 'Horas',
    notes: 'Notas',
    workerContractId: 'Contrato'
  };

  const defaultData = removeUnreferencedKeys(
    initialWorkerManualFrequency,
    fieldLabels
  ) as IWorkerManualFrequencyEdit;

  defaultData.date = getDateUTC(defaultData.date as string);
  defaultData.userId = userId;

  const initialServerState: IActionResultForm<
    IWorkerManualFrequencyEdit,
    IWorkerManualFrequency
  > = {
    errorsServer: [],
    message: ''
  };

  const redirect = () => {
    router.push('/worker-manual-frequency');
  };

  return (
    <>
      <FormAddHeader
        Icon={CalendarPlus}
        title='Atualizar Frequência Manual'
        subtitle='Atualizar informações de uma frequência manual no sistema'
      />

      <WorkerManualFrequencyForm
        mode='edit'
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={updateWorkerManualFrequency}
        formSchema={workerManualFrequencyFormSchemaEdit}
        SubmitButtonIcon={Save}
        submitButtonText='Salvar'
        relatedData={relatedData}
        isInDialog={isInDialog}
      />
    </>
  );
}
