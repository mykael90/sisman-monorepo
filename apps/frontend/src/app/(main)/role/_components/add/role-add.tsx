'use client';

import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import RoleForm from '../form/role-form';
import { IRole, IRoleAdd } from '../../role-types';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { CirclePlus } from 'lucide-react'; // Using CirclePlus for Role
import { addRole } from '../../role-actions';
import { roleFormSchemaAdd } from '../form/role-form-validation';
import { NonOptionalKeys } from '../../../../../types/utils-types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RoleAdd({
  isInDialog = false
}: {
  isInDialog?: boolean;
}) {
  const defaultData: IRoleAdd = {
    id: '' as any,
    role: '',
    description: ''
  };

  // Note: IRoleAdd from role-types.ts includes 'id' and other Prisma fields
  // but the form only needs 'role' and 'description' for adding.
  // We define fieldLabels for the fields the form will actually use.
  const fieldLabels: Record<
    keyof Pick<IRoleAdd, 'id' | 'role' | 'description'>,
    string
  > = {
    id: 'ID',
    role: 'Nome do Papel',
    description: 'Descrição'
  };

  const initialServerState: IActionResultForm<IRoleAdd, IRole> = {
    errorsServer: [],
    message: ''
  };

  const router = useRouter();

  const redirect = () => {
    router.push('/role');
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      {/* Header */}
      <FormAddHeader
        Icon={CirclePlus} // Using CirclePlus for Role
        title='Novo Papel'
        subtitle='Adicionar um novo papel (role) ao sistema'
      ></FormAddHeader>

      {/* Form Section */}
      <RoleForm
        key={formKey}
        mode='add'
        onClean={triggerFormReset}
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels as any} // Cast needed because fieldLabels doesn't cover all IRoleAdd keys
        formActionProp={addRole}
        formSchema={roleFormSchemaAdd}
        SubmitButtonIcon={CirclePlus}
        submitButtonText='Criar Papel'
        isInDialog={isInDialog}
      ></RoleForm>
    </div>
  );
}
