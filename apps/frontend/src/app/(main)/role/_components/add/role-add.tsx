'use client';

import { useState } from 'react';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import RoleForm from '../form/role-form';
import { IRoleAdd } from '../../role-types';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { ShieldPlus } from 'lucide-react'; // Ícone para adicionar Role
import { addRole } from '../../role-actions';
import { roleFormSchemaAdd } from '../form/role-form-validation';

export default function RoleAdd() {
  const defaultData: IRoleAdd = {
    role: '',
    description: ''
  };

  const fieldLabels: Partial<Record<keyof IRoleAdd, string>> = {
    role: 'Nome do Papel',
    description: 'Descrição'
  };

  const initialServerState: IActionResultForm<IRoleAdd> = {
    isSubmitSuccessful: false,
    message: ''
  };

  // Para controlar a chave do formulário e forçar o reset do useActionState
  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto mt-4 w-full max-w-2xl rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        Icon={ShieldPlus}
        title='Novo Papel'
        subtitle='Adicionar um novo papel ao sistema'
      />
      <RoleForm
        key={formKey}
        mode='add'
        onCancel={triggerFormReset} // Reseta o formulário e seu estado de ação
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={addRole}
        formSchema={roleFormSchemaAdd}
        SubmitButtonIcon={ShieldPlus}
        submitButtonText='Criar Papel'
      />
    </div>
  );
}
