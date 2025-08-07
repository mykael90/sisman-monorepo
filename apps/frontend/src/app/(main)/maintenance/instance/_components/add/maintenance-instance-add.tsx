'use client';

import { FilePlus } from 'lucide-react';
import FormAddHeader from '../../../../../../components/form-tanstack/form-add-header';
import { addInstance } from '../../maintenance-instance-actions';
import MaintenanceInstanceForm from '../form/maintenance-instance-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IActionResultForm } from '../../../../../../types/types-server-actions';
import { maintenanceInstanceFormSchemaAdd } from '../form/maintenance-instance-form-validation';
import { IMaintenanceInstanceAdd } from '../../maintenance-instance-types';

export default function MaintenanceInstanceAdd({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const defaultData: IMaintenanceInstanceAdd = {
    name: '',
    sipacId: ''
  };

  const fieldLabels: Partial<Record<keyof IMaintenanceInstanceAdd, string>> = {
    name: 'Nome da Instância',
    sipacId: 'Código SIPAC'
  };

  const initialServerState: IActionResultForm<IMaintenanceInstanceAdd, any> = {
    errorsServer: [],
    message: ''
  };

  const router = useRouter();
  const redirect = () => {
    router.push('/maintenance/instance');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        Icon={FilePlus}
        title='Nova Instância de Manutenção'
        subtitle='Adicionar uma nova instância de manutenção no sistema'
      ></FormAddHeader>

      <MaintenanceInstanceForm
        key={formKey}
        mode='add'
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={addInstance}
        formSchema={maintenanceInstanceFormSchemaAdd}
        SubmitButtonIcon={FilePlus}
        submitButtonText='Criar Instância'
        isInDialog={isInDialog}
      />
    </div>
  );
}
