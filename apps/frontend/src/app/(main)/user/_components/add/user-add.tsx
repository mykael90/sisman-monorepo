'use client';

import type React from 'react';
import { useState } from 'react';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import UserForm from '../form/user-form';
import { IUser, IUserAdd } from '../../user-types';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { UserPlus } from 'lucide-react';
import { addUser } from '../../user-actions';
import { userFormSchemaAdd } from '../form/user-form-validation';
import { IRoleList } from '../../../role/role-types';
import { NonOptionalKeys } from '../../../../../types/utils-types';

// We are transforming this into a page, so it won't take props like onClose or onSubmit.
// The page will manage its own state and submission logic.
export default function UserAdd({
  possibleRoles,
  isInDialog = false
}: {
  possibleRoles: IRoleList[];
  isInDialog?: boolean;
}) {
  const defaultData: IUserAdd = {
    name: '',
    login: '',
    email: '',
    roles: []
  };

  const fieldLabels: Record<NonOptionalKeys<IUserAdd>, string> = {
    name: 'Nome',
    login: 'Login',
    email: 'E-mail',
    roles: 'Permissões'
  };

  const initialServerState: IActionResultForm<IUserAdd, IUser> = {
    errorsServer: [],
    message: ''
  };

  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      {/* Header */}
      <FormAddHeader
        Icon={UserPlus}
        title='Novo Usuário'
        subtitle='Adicionar um novo usuário ao sistema'
      ></FormAddHeader>

      {/* Form Section */}
      <UserForm
        key={formKey}
        mode='add'
        onClean={triggerFormReset}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={addUser}
        formSchema={userFormSchemaAdd}
        SubmitButtonIcon={UserPlus}
        submitButtonText='Criar Usuário'
        possibleRoles={possibleRoles}
        isInDialog={isInDialog}
      ></UserForm>
    </div>
  );
}
