'use client';

import { useRouter } from 'next/navigation';
import FormAddHeader from '@/components/form-tanstack/form-add-header';
import UserForm from '../form/user-form';
import { IUser, IUserEdit, IUserRelatedData } from '../../user-types';
import { IActionResultForm } from '@/types/types-server-actions';
import { Save, UserPlus } from 'lucide-react';
import { updateUser } from '../../user-actions';
import { userFormSchemaEdit } from '../form/user-form-validation';
import { IRole } from '../../../role/role-types';
import { NonOptionalKeys } from '@/types/utils-types';
import { removeUnreferencedKeys } from '@/lib/form-utils';

// We are transforming this into a page, so it won't take props like onClose or onSubmit.
// The page will manage its own state and submission logic.
export default function UserEdit({
  initialUser,
  relatedData,
  isInDialog = false
}: {
  initialUser: IUserEdit;
  relatedData: IUserRelatedData;
  isInDialog?: boolean;
}) {
  const fieldLabels: Partial<Record<keyof IUserEdit, string>> = {
    id: 'ID',
    name: 'Nome',
    login: 'Login',
    email: 'E-mail',
    roles: 'Permissões',
    isActive: 'Ativo',
    maintenanceInstanceId: 'Instância de Manutenção'
  };

  const defaultData = removeUnreferencedKeys(initialUser, fieldLabels);

  const initialServerState: IActionResultForm<IUserEdit, IUser> = {
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
      {/* {JSON.stringify(listRoles)} */}
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
        relatedData={relatedData}
        isInDialog={isInDialog}
      ></UserForm>
    </div>
  );
}
