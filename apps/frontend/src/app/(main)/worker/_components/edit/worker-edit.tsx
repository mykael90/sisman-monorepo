'use client';

import { workerFormSchemaEdit } from '../form/worker-form-validation';
import { updateWorker } from '../../worker-actions';
import { useRouter } from 'next/navigation';
import { IWorker, IWorkerEdit, IWorkerRelatedData } from '../../worker-types';
import { removeUnreferencedKeys } from '../../../../../lib/form-utils';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import WorkerForm from '../form/worker-form';
import { Save, UserPlus } from 'lucide-react';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import { getDateUTC } from '../../../../../lib/utils';
import { format } from 'date-fns';

export default function WorkerEdit({
  initialWorker,
  relatedData,
  isInDialog = false
}: {
  initialWorker: IWorker;
  relatedData: IWorkerRelatedData;
  isInDialog?: boolean;
}) {
  const fieldLabels = {
    id: 'ID',
    name: 'Nome',
    cpf: 'CPF',
    email: 'Email',
    phone: 'Telefone',
    birthdate: 'Data de Nascimento',
    maintenanceInstanceId: 'Instância de Manutenção',
    isActive: 'Ativo'
  };

  const defaultData = removeUnreferencedKeys(initialWorker, fieldLabels);

  defaultData.birthdate = defaultData.birthdate
    ? (format(getDateUTC(defaultData.birthdate as any), 'yyyy-MM-dd') as any)
    : null;

  const initialServerState: IActionResultForm<IWorkerEdit, IWorker> = {
    errorsServer: [],
    message: ''
  };

  // Para controlar a chave do formulário e forçar o reset do useActionState
  const router = useRouter();

  const redirect = () => {
    router.push('/worker');
  };

  return (
    <>
      <FormAddHeader
        Icon={UserPlus}
        title='Atualizar colaborador'
        subtitle='Atualizar informações de um colaborador no sistema'
      />

      <WorkerForm
        mode='edit'
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={updateWorker}
        formSchema={workerFormSchemaEdit}
        SubmitButtonIcon={Save}
        submitButtonText='Salvar'
        relatedData={relatedData}
        isInDialog={isInDialog}
      />
    </>
  );
}
