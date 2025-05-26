'use client';

import { useRouter } from 'next/navigation';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header'; // Reutilizável
import RoleForm from '../form/role-form'; // O formulário que acabamos de criar
import { IRoleEdit } from '../../role-types';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { Save, ShieldCheck } from 'lucide-react'; // Ícones para Role
import { updateRole } from '../../role-actions';
import { roleFormSchemaEdit } from '../form/role-form-validation';

export default function RoleEdit({ initialRole }: { initialRole: IRoleEdit }) {
  const router = useRouter();

  const defaultData = { ...initialRole };

  const fieldLabels: Partial<Record<keyof IRoleEdit, string>> = {
    id: 'ID',
    role: 'Nome do Papel',
    description: 'Descrição'
  };

  const initialServerState: IActionResultForm<IRoleEdit> = {
    isSubmitSuccessful: false,
    message: ''
  };

  const handleCancel = () => {
    router.push('/role'); // Navega para a lista de papéis ao cancelar
  };

  return (
    <div className='mx-auto mt-4 w-full max-w-2xl rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        Icon={ShieldCheck} // Ícone para editar papel
        title='Atualizar Papel'
        subtitle='Atualizar informações de um papel no sistema'
      />

      <RoleForm
        mode='edit'
        onCancel={handleCancel}
        defaultData={defaultData}
        initialServerState={initialServerState}
        fieldLabels={fieldLabels}
        formActionProp={updateRole}
        formSchema={roleFormSchemaEdit}
        SubmitButtonIcon={Save}
        submitButtonText='Salvar Alterações'
      />
    </div>
  );
}
