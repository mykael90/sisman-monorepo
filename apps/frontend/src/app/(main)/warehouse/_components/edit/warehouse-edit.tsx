'use client';

import { Save } from 'lucide-react';
import FormAddHeader from '@/components/form-tanstack/form-add-header';
import { updateWarehouse } from '../../warehouse-actions';
import WarehouseForm from '../form/warehouse-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { warehouseFormSchemaEdit } from '../form/warehouse-form-validation';
import { IWarehouseEdit } from '../../warehouse-types';
import { IMaintenanceInstance } from '../../../maintenance/instance/instance-types';
import { removeUnreferencedKeys } from '@/lib/form-utils';

interface WarehouseEditProps {
  initialWarehouse: IWarehouseEdit;
  isInDialog?: boolean;
  relatedData: { listMaitenanceInstances: IMaintenanceInstance[] };
}

export function WarehouseEdit({
  initialWarehouse,
  isInDialog = false,
  relatedData
}: WarehouseEditProps) {
  const fieldLabels: Partial<Record<keyof IWarehouseEdit, string>> = {
    id: 'ID',
    name: 'Nome do Depósito',
    code: 'Código',
    location: 'Localização',
    isActive: 'Ativo',
    maintenanceInstanceId: 'Instância de Manutenção'
  };

  const defaultData: IWarehouseEdit = removeUnreferencedKeys(
    initialWarehouse,
    fieldLabels
  );

  const initialServerState: IActionResultForm<IWarehouseEdit, any> = {
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
        Icon={Save}
        title='Editar Depósito'
        subtitle='Atualizar informações do depósito no sistema'
      ></FormAddHeader>

      <WarehouseForm
        key={formKey}
        mode='edit'
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={updateWarehouse}
        formSchema={warehouseFormSchemaEdit}
        SubmitButtonIcon={Save}
        submitButtonText='Salvar Alterações'
        isInDialog={isInDialog}
        relatedData={relatedData}
      />
    </div>
  );
}
