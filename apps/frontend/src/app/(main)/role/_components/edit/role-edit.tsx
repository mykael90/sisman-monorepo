'use client';

import { useRouter } from 'next/navigation';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import RoleForm from '../form/role-form';
import { IRole, IRoleEdit } from '../../role-types';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { Save, CircleUserRound } from 'lucide-react'; // Using CircleUserRound for Role Edit header
import { updateRole } from '../../role-actions';
import { roleFormSchemaEdit } from '../form/role-form-validation';
import { NonOptionalKeys } from '../../../../../types/utils-types';
import { removeUnreferencedKeys } from '../../../../../lib/form-utils';

export default function RoleEdit({
  initialRole,
  isInDialog = false
}: {
  initialRole: IRoleEdit;
  isInDialog?: boolean;
}) {
  // Note: IRoleEdit from role-types.ts includes 'id' and other Prisma fields
  // but the form only needs 'id', 'role' and 'description' for editing.
  // We define fieldLabels for the fields the form will actually use.
  const fieldLabels: Record<
    keyof Pick<IRoleEdit, 'id' | 'role' | 'description'>,
    string
  > = {
    id: 'ID',
    role: 'Nome do Papel',
    description: 'Descrição'
  };

  const defaultData: IRoleEdit = removeUnreferencedKeys(
    initialRole,
    fieldLabels
  );

  const initialServerState: IActionResultForm<IRoleEdit, IRole> = {
    errorsServer: [],
    message: ''
  };

  const router = useRouter();

  const redirect = () => {
    router.push('/role');
  };

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      {/* Header */}
      <FormAddHeader
        Icon={CircleUserRound} // Using CircleUserRound for Role Edit header
        title='Atualizar Papel'
        subtitle='Atualizar informações de um papel (role) no sistema'
      ></FormAddHeader>

      {/* Form Section */}
      <RoleForm
        mode='edit'
        onCancel={redirect}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels as any} // Cast needed because fieldLabels doesn't cover all IRoleEdit keys
        formActionProp={updateRole}
        formSchema={roleFormSchemaEdit}
        SubmitButtonIcon={Save}
        submitButtonText='Salvar'
        isInDialog={isInDialog}
      ></RoleForm>
    </div>
  );
}
