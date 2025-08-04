'use client';

import type React from 'react';
import { useState } from 'react';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import UserForm from '../form/user-form';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { UserPlus } from 'lucide-react';
import { addUser } from '../../user-actions';
import {
  RoleBase,
  UserWithRoles,
  UserFormSchemaAdd,
  userFormSchemaAdd
} from '@sisman/types';
import { NonOptionalKeys } from '../../../../../types/utils-types';
import { useRouter } from 'next/navigation';

// We are transforming this into a page, so it won't take props like onClose or onSubmit.
// The page will manage its own state and submission logic.
export default function UserAdd({
  possibleRoles,
  isInDialog = false,
  preDefaultData = {}
}: {
  possibleRoles: RoleBase[];
  isInDialog?: boolean;
  preDefaultData?: Partial<UserFormSchemaAdd>;
}) {
  const defaultData: UserFormSchemaAdd = {
    name: '',
    login: '',
    email: '',
    roles: [],
    ...preDefaultData
  };

  const fieldLabels: Record<NonOptionalKeys<UserFormSchemaAdd>, string> = {
    name: 'Nome',
    login: 'Login',
    email: 'E-mail',
    roles: 'Permissões'
  };

  const initialServerState: IActionResultForm<
    UserFormSchemaAdd,
    UserWithRoles
  > = {
    errorsServer: [],
    message: ''
  };

  // Para controlar a chave do formulário e forçar o reset do useActionState
  const router = useRouter();

  const redirect = () => {
    router.push('/user');
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
        onCancel={redirect}
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
