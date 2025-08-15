'use client';

import { Pencil, Save } from 'lucide-react';
import FormAddHeader from '@/components/form-tanstack/form-add-header';
import { updateInstance } from '../../instance-actions'; // showInstance is no longer needed here
import MaintenanceInstanceForm from '../form/maintenance-instance-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react'; // useEffect and getSismanAccessToken are no longer needed here
import { IActionResultForm } from '../../../../../../types/types-server-actions';
import { maintenanceInstanceFormSchemaEdit } from '../form/maintenance-instance-form-validation';
import { IMaintenanceInstanceEdit } from '../../instance-types';
import { removeUnreferencedKeys } from '@/lib/form-utils';

export default function MaintenanceInstanceEdit({
  initialInstance,
  isInDialog = false
}: {
  initialInstance: IMaintenanceInstanceEdit; // Now receives the full instance object
  isInDialog?: boolean;
}) {
  const fieldLabels: Record<
    keyof Pick<IMaintenanceInstanceEdit, 'id' | 'name' | 'sipacId'>,
    string
  > = {
    id: 'ID', // Add ID to fieldLabels for edit form
    name: 'Nome da Instância',
    sipacId: 'Código SIPAC'
  };

  const defaultData: IMaintenanceInstanceEdit = removeUnreferencedKeys(
    initialInstance,
    fieldLabels
  ); // Use the passed initialInstance directly

  const initialServerState: IActionResultForm<IMaintenanceInstanceEdit, any> = {
    errorsServer: [],
    message: ''
  };

  const router = useRouter();
  const redirect = () => {
    router.push('/maintenance/instance');
  };

  // const [formKey, setFormKey] = useState(() => Date.now().toString());
  // const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        Icon={Pencil}
        title='Editar Instância de Manutenção'
        subtitle={`Editando instância: ${defaultData.name}`}
      ></FormAddHeader>

      <MaintenanceInstanceForm
        // key={formKey}
        mode='edit'
        // onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={updateInstance}
        formSchema={maintenanceInstanceFormSchemaEdit}
        SubmitButtonIcon={Save}
        submitButtonText='Salvar'
        isInDialog={isInDialog}
      />
    </div>
  );
}
