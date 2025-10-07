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

export default function WorkerManualFrequencyEdit({
  initialWorkerManualFrequency,
  relatedData,
  isInDialog = false
}: {
  initialWorkerManualFrequency: IWorkerManualFrequency;
  relatedData: IWorkerManualFrequencyRelatedData;
  isInDialog?: boolean;
}) {
  const fieldLabels = {
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

  const initialServerState: IActionResultForm<
    IWorkerManualFrequencyEdit,
    IWorkerManualFrequency
  > = {
    errorsServer: [],
    message: ''
  };

  const router = useRouter();

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
