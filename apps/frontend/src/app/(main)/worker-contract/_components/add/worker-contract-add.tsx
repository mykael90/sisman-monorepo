'use client';

import FormAddHeader from '@/components/form-tanstack/form-add-header';
import WorkerContractForm from '../form/worker-contract-form';
import {
  IWorkerContract,
  IWorkerContractAdd,
  IWorkerContractRelatedData
} from '../../worker-contract-types';
import { IActionResultForm } from '@/types/types-server-actions';
import { CirclePlus } from 'lucide-react';
import { addWorkerContract } from '../../worker-contract-actions';
import { workerContractFormSchemaAdd } from '../form/worker-contract-form-validation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IWorker } from '../../../worker/worker-types';

export default function WorkerContractAdd({
  isInDialog = false,
  worker,
  relatedData
}: {
  worker: IWorker;
  isInDialog?: boolean;
  relatedData: IWorkerContractRelatedData;
}) {
  const defaultData: IWorkerContractAdd = {
    workerId: 0,
    contractId: '',
    workerSpecialtyId: '',
    sipacUnitLocationId: '',
    startDate: '',
    endDate: '',
    notes: ''
  };

  const fieldLabels: Partial<Record<keyof IWorkerContractAdd, string>> = {
    workerId: 'Colaborador',
    contractId: 'Contrato',
    workerSpecialtyId: 'Especialidade',
    sipacUnitLocationId: 'Unidade SIPAC',
    startDate: 'Início',
    endDate: 'Fim',
    notes: 'Notas'
  };

  const initialServerState: IActionResultForm<
    IWorkerContractAdd,
    IWorkerContract
  > = {
    errorsServer: [],
    message: ''
  };

  const router = useRouter();

  const redirect = () => {
    router.push('/worker');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        Icon={CirclePlus}
        title='Nova Contrato de Colaborador'
        subtitle='Adicionar um nova contrato para o colaborador'
      />

      {JSON.stringify(worker)}

      <WorkerContractForm
        key={formKey}
        mode='add'
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels as any}
        formActionProp={addWorkerContract}
        formSchema={workerContractFormSchemaAdd}
        SubmitButtonIcon={CirclePlus}
        submitButtonText='Criar Contrato'
        isInDialog={isInDialog}
        relatedData={relatedData}
      />
    </div>
  );
}
