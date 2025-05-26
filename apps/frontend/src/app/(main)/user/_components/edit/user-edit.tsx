'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import FormAddHeader from '../../../../../components/form-tanstack/form-add-header';
import UserForm from '../form/user-form';
import { IUserEdit } from '../../user-types';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { Save, UserPlus } from 'lucide-react';
import { updateUser } from '../../user-actions';
import { userFormSchemaEdit } from '../form/user-form-validation';

// We are transforming this into a page, so it won't take props like onClose or onSubmit.
// The page will manage its own state and submission logic.
export default function UserEdit({ initialUser }: { initialUser: IUserEdit }) {
  // const router = useRouter();
  // const [formData, setFormData] = useState<IUserAdd>({
  //   name: '',
  //   login: '',
  //   email: ''
  //   // avatarUrl: '',
  //   // roles: []
  // });

  const defaultData = { ...initialUser };

  const fieldLabels: IUserEdit = {
    id: 'ID',
    name: 'Nome',
    login: 'Login',
    email: 'E-mail'
  };

  const initialServerState: IActionResultForm<IUserEdit> = {
    errorsServer: [],
    message: ''
  };

  // Para controlar a chave do formulário e forçar o reset do useActionState
  const router = useRouter();

  const redirect = () => {
    router.push('/user');
  };
  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();
  //   // TODO: Implement the actual user creation logic here
  //   // For example, make an API call:
  //   // try {
  //   //   const response = await fetch('/api/users', { method: 'POST', body: JSON.stringify(formData) });
  //   //   if (response.ok) {
  //   //     alert('User created successfully!');
  //   //     router.push('/users'); // Navigate to the users list or another appropriate page
  //   //   } else { //   alert('Failed to create user.'); }
  //   // } catch (error) { console.error('Error creating user:', error); alert('An error occurred.'); }
  //   console.log('Form submitted:', formData);
  //   alert(
  //     `User data submitted (in a real app, this would call an API):\n${JSON.stringify(formData, null, 2)}`
  //   );
  //   router.push('/users'); // Example navigation after submission
  // };

  // const updateFormData = (data: Partial<UserFormData>) => {
  //   setFormData((prev) => ({ ...prev, ...data }));
  // };

  return (
    <div className='mx-auto mt-4 w-full max-w-2xl rounded-lg bg-white shadow-lg'>
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
      ></UserForm>
    </div>
  );
}
