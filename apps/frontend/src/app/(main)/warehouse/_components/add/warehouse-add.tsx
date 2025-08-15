'use client';

import { FilePlus } from 'lucide-react';
import FormAddHeader from '@/components/form-tanstack/form-add-header';
import { addWarehouse } from '../../warehouse-actions';
import WarehouseForm from '../form/warehouse-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IActionResultForm } from '@/types/types-server-actions';
import { warehouseFormSchemaAdd } from '../form/warehouse-form-validation';
import { IWarehouseAdd } from '../../warehouse-types';
import { IMaintenanceInstance } from '../../../maintenance/instance/instance-types';

export function WarehouseAdd({
  isInDialog = false,
  relatedData
}: {
  isInDialog?: boolean;
  relatedData: { listMaitenanceInstances: IMaintenanceInstance[] };
}) {
  const defaultData: IWarehouseAdd = {
    name: '',
    code: '',
    location: '',
    isActive: true,
    maintenanceInstanceId: 0
  };

  const fieldLabels: Partial<Record<keyof IWarehouseAdd, string>> = {
    name: 'Nome do Depósito',
    code: 'Código',
    location: 'Localização',
    isActive: 'Ativo',
    maintenanceInstanceId: 'Instância de Manutenção'
  };

  const initialServerState: IActionResultForm<IWarehouseAdd, any> = {
    errorsServer: [],
    message: ''
  };

  const router = useRouter();
  const redirect = () => {
    router.push('/warehouse');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        Icon={FilePlus}
        title='Novo Depósito'
        subtitle='Adicionar um novo depósito no sistema'
      ></FormAddHeader>

      <WarehouseForm
        key={formKey}
        mode='add'
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={addWarehouse}
        formSchema={warehouseFormSchemaAdd}
        SubmitButtonIcon={FilePlus}
        submitButtonText='Criar Depósito'
        isInDialog={isInDialog}
        relatedData={relatedData}
      />
    </div>
  );
}
