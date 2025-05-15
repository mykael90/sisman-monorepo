'use client';

import type React from 'react';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UserHeader } from './user-add-header';
import { UserForm } from './user-add-form';
import { IUserAdd } from '../../users-types';
import { ICreateUserActionResult } from '../../users-actions';

// We are transforming this into a page, so it won't take props like onClose or onSubmit.
// The page will manage its own state and submission logic.
export default function UserAdd() {
  // const router = useRouter();
  // const [formData, setFormData] = useState<IUserAdd>({
  //   name: '',
  //   login: '',
  //   email: ''
  //   // avatarUrl: '',
  //   // roles: []
  // });

  const defaultData: IUserAdd = {
    name: '',
    login: '',
    email: ''
  };

  const initialServerState: ICreateUserActionResult = {
    errorsServer: [],
    message: ''
  };

  // Para controlar a chave do formulário e forçar o reset do useActionState
  const [formKey, setFormKey] = useState(() => Date.now().toString());
  const triggerFormReset = () => setFormKey(Date.now().toString());

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
    <div className='mx-auto my-8 w-full max-w-2xl rounded-lg bg-white shadow-lg'>
      {/* Header */}
      <UserHeader></UserHeader>

      {/* Form Section */}
      <UserForm
        key={formKey}
        onWantToReset={triggerFormReset}
        defaultData={defaultData}
        initialServerState={initialServerState}
      ></UserForm>
    </div>
  );
}
