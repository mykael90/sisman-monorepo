'use client';

import { useRouter } from 'next/navigation';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import UserForm from '../form/user-form';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { Save, UserPlus } from 'lucide-react';
import { updateUser } from '../../user-actions';
import {
  RoleBase,
  userFormSchemaEdit,
  UserWithRoles,
  UserFormSchemaEdit
} from '@sisman/types';
import { NonOptionalKeys } from '../../../../../types/utils-types';

// We are transforming this into a page, so it won't take props like onClose or onSubmit.
// The page will manage its own state and submission logic.
export default function UserEdit({
  initialUser,
  possibleRoles,
  isInDialog = false
}: {
  initialUser: UserFormSchemaEdit;
  possibleRoles: RoleBase[];
  isInDialog?: boolean;
}) {
  const defaultData = { ...initialUser };

  const fieldLabels: Record<NonOptionalKeys<UserFormSchemaEdit>, string> = {
    id: 'ID',
    name: 'Nome',
    login: 'Login',
    email: 'E-mail',
    roles: 'Permissões',
    isActive: 'Ativo'
  };

  const initialServerState: IActionResultForm<
    UserFormSchemaEdit,
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

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      {/* {JSON.stringify(possibleRoles)} */}
      {/* Header */}
      <FormAddHeader
        Icon={UserPlus}
        title='Atualizar Usuário'
        subtitle='Atualizar informações de um usuário no sistema'
      ></FormAddHeader>

      {/* Form Section */}
      <UserForm
        mode='edit'
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={updateUser}
        formSchema={userFormSchemaEdit}
        SubmitButtonIcon={Save}
        submitButtonText='Salvar'
        possibleRoles={possibleRoles}
        isInDialog={isInDialog}
      ></UserForm>
    </div>
  );
}
