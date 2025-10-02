'use client';

import FormAddHeader from '@/components/form-tanstack/form-add-header';
import WorkerContractForm from '../form/worker-contract-form';
import {
  IWorkerContract,
  IWorkerContractEdit,
  IWorkerContractRelatedData,
  IWorkerContractWithRelations
} from '../../../worker-contract-types';
import { IActionResultForm } from '@/types/types-server-actions';
import { CirclePlus } from 'lucide-react';
import { workerContractFormSchemaAdd } from '../form/worker-contract-form-validation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CardWorkerSummary } from '../card-worker-summary';
import { IWorker } from '../../../../worker-types';
import { removeUnreferencedKeys } from '../../../../../../../lib/form-utils';
import { updateWorkerContract } from '../../../worker-contract-actions';
import { getDateUTC } from '../../../../../../../lib/utils';

export default function WorkerContractEdit({
  isInDialog = false,
  initialWorkerContract,
  worker,
  relatedData
}: {
  initialWorkerContract: IWorkerContractWithRelations;
  worker: IWorker;
  isInDialog?: boolean;
  relatedData: IWorkerContractRelatedData;
}) {
  const fieldLabels: Partial<Record<keyof IWorkerContractEdit, string>> = {
    id: 'ID',
    workerId: 'Colaborador',
    contractId: 'Contrato',
    workerSpecialtyId: 'Especialidade',
    sipacUnitLocationId: 'Unidade SIPAC',
    startDate: 'Início',
    endDate: 'Fim',
    notes: 'Notas',
    sipacUnitLocationCode: 'Codigo Unidade SIPAC'
  };

  const defaultData = {
    ...removeUnreferencedKeys(initialWorkerContract, fieldLabels),
    sipacUnitLocationCode:
      initialWorkerContract.sipacUnitLocation?.codigoUnidade || '',
    sipacUnitLocationId: '',
    startDate: getDateUTC(initialWorkerContract.startDate as any),
    endDate: getDateUTC(initialWorkerContract.endDate as any)
  };

  const initialServerState: IActionResultForm<
    IWorkerContractEdit,
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
        title='Alterar Contrato de Colaborador'
        subtitle='Alterar o contrato para o colaborador'
      />

      <div className='p-6'>
        <CardWorkerSummary worker={worker} />
      </div>

      <WorkerContractForm
        mode='edit'
        key={formKey}
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels as any}
        formActionProp={updateWorkerContract}
        formSchema={workerContractFormSchemaAdd}
        SubmitButtonIcon={CirclePlus}
        submitButtonText='Alterar Contrato'
        isInDialog={isInDialog}
        relatedData={relatedData}
      />
    </div>
  );
}
