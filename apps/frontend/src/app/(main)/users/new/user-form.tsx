// src/components/user-form.tsx
'use client';

import React, { useActionState, useRef, useState } from 'react';
import { useForm, useTransform, mergeForm } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';

// Seus componentes e tipos
import { UserAvatar } from './user-avatar';
import { UserRolesSelector } from './users-rolers-selector';
import { Button } from '@/components/ui/button';
import { UserPlus, AlertCircle } from 'lucide-react';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { UserFormData } from './user';
import { addUser, ICreateUserActionResult } from '../_actions';
import { formOpts } from './shared-code';

// (Opcional: Zod para validação client-side)
// import { zodValidator } from '@tanstack/zod-form-adapter';
// import { z } from 'zod';
// const clientUserFormSchema = z.object({ ... }); // Schema Zod para cliente

const myInitialState: ICreateUserActionResult = {
  errorMap: {},
  errors: [],
  message: ''
};

function UserForm({
  setFormKey
}: {
  setFormKey: React.Dispatch<React.SetStateAction<string>>;
}) {
  // useActionState para interagir com a Server Action
  // O tipo de serverState será inferido de ICreateUserActionResult

  const [serverState, formAction, isPending] = useActionState(
    addUser,
    myInitialState
  );

  const form = useForm({
    ...formOpts,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}), // serverState aqui é CreateUserActionResult
      [serverState]
    )
  });

  // validatorAdapter: zodValidator, // Para validação client-side com Zod
  // clientValidation: clientUserFormSchema, // Se estiver usando Zod

  // A action é chamada pelo atributo 'action' do <form> HTML.
  // Mas podemos manter um onSubmit para lógica client-side se necessário ANTES da action.
  // No entanto, com o padrão server action, é mais comum não ter um onSubmit aqui.
  // A validação do TanStack Form ainda roda antes da server action ser chamada.

  // Lógica que executa na renderização se houver um novo estado de sucesso
  // TODO:

  // // Se a submissão foi bem-sucedida, mostramos uma mensagem e um botão para adicionar outro.
  // if (state?.isSubmitSuccessful) {
  //   // Os valores do formulário já devem ter sido "resetados" pelo mergeForm
  //   // usando o `submittedData` (que eram os defaultValues) da action.
  //   return (
  //     <div className='rounded-lg bg-white p-6 text-center shadow-md'>
  //       <h2 className='mb-4 text-xl font-semibold text-green-600'>
  //         {serverState.message || 'Operation successful!'}
  //       </h2>
  //       {serverState.createdUser && (
  //         <p className='mb-4 text-sm text-gray-700'>
  //           Usuário: {serverState.createdUser.name} (ID:{' '}
  //           {serverState.createdUser.id})
  //         </p>
  //       )}
  //       <Button
  //         onClick={() => {
  //           form.reset(); // Reseta o estado do TanStack Form (meta, touched, etc.)
  //           // setFormKey(Date.now().toString()); // Muda a key para resetar o useActionState
  //           onSuccessCalledRef.current = false; // Permite que onSuccess seja chamado novamente
  //         }}
  //       >
  //         Adicionar Outro Usuário
  //       </Button>
  //     </div>
  //   );
  // }

  const handleResetForm = () => {
    form.reset(); // 1. Reseta o estado interno do TanStack Form para defaultValues
    // 2. Mudar a key força a recriação do <form> e de seus hooks internos,
    //    incluindo a reinicialização do useActionState para myInitialServerState.
    setFormKey(Date.now().toString());
  };

  //sempre que JSON.stringify(formState.fieldMeta) muda dentro do estado do form.store, o formulário é renderizado novamente
  const fieldErrors = useStore(form.store, (formState) =>
    JSON.stringify(formState.fieldMeta)
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // e.preventDefault(); // Não é necessário com action={formAction}
        // e.stopPropagation(); // Opcional
        form.handleSubmit(); // Executa validações client do TanStack Form
        // Se válido, o <form> prossegue com a 'formAction'
      }}
      onReset={(e) => {
        e.preventDefault(); // Previne o reset nativo do HTML se você quiser controle total
        handleResetForm();
      }}
      className='rounded-lg bg-white p-6 shadow-md'
    >
      {/* {formErrors.length > 0 && (
        <div className='mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700'>
          <div className='flex items-center'>
            <AlertCircle className='mr-2 h-5 w-5' />
            <strong>Error:</strong>
          </div>
          <ul className='mt-1 ml-5 list-inside list-disc'>
            {formErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )} */}

      {/* Exibir a mensagem geral do servidor */}
      {serverState &&
        serverState.message &&
        !serverState.isSubmitSuccessful && (
          <div
            className={`mb-4 rounded border p-3 ${serverState.isSubmitSuccessful === false ? 'border-red-400 bg-red-100 text-red-700' : 'border-green-400 bg-green-100 text-green-700'}`}
          >
            <div className='flex items-center'>
              <AlertCircle className='mr-2 h-5 w-5' />{' '}
              {/* Ou CheckCircle para sucesso */}
              <strong>
                {serverState.isSubmitSuccessful === false ? 'Error:' : 'Info:'}
              </strong>
            </div>
            <p className='mt-1 ml-7'>{serverState.message}</p>
          </div>
        )}

      <div className='bg-red-100'>{JSON.stringify(form.state, null, 2)}</div>

      <div className='bg-blue-100'>{JSON.stringify(serverState, null, 2)}</div>

      {/* Exibe erros gerais do formulário Tanstack (geralmente de validação client) */}
      {/* Este se sobreporia ao de cima se 'FORM' for usado. */}
      {/*
      <form.Subscribe selector={(state) => state.errors?.FORM}>
        {(formErrors) =>
          formErrors && formErrors.length > 0 ? (
            <div className='mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700'>
              <div className='flex items-center'>
                <AlertCircle className='mr-2 h-5 w-5' />
                <strong>Error:</strong>
              </div>
              <ul className='mt-1 ml-5 list-inside list-disc'>
                {formErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          ) : null
        }
      </form.Subscribe>
      */}

      {/* <form.Field
        name='avatarUrl'
        // Adicione validadores client-side se desejar
      >
        {(field) => (
          <div className='mb-6 flex flex-col items-center'>
            <UserAvatar
              value={field.state.value}
              onChange={(url: string | undefined) =>
                field.handleChange(url || '')
              }
            />
            {field.state.meta.touchedErrors?.length ? (
              <em className='mt-1 text-xs text-red-500'>
                {field.state.meta.touchedErrors.join(', ')}
              </em>
            ) : null}
            {field.state.meta.errors.map((error) => (
              <p key={error as string} className='mt-1 text-xs text-red-500'>
                {error}
              </p>
            ))}
          </div>
        )}
      </form.Field> */}

      <form.Field
        name='name'
        // validators={{ onChange: clientUserFormSchema?.shape.name }}
      >
        {(field) => (
          <FormInputField
            field={field}
            label='Full Name'
            placeholder='Enter full name'
          />
        )}
      </form.Field>

      <form.Field name='login'>
        {(field) => (
          <FormInputField
            field={field}
            label='Login'
            placeholder='Enter login'
          />
        )}
      </form.Field>

      <form.Field name='email'>
        {(field) => (
          <FormInputField
            field={field}
            label='Email'
            type='email'
            placeholder='Enter email address'
          />
        )}
      </form.Field>

      {/* <div className='mt-6'>
        <h3 className='mb-2 text-sm font-medium text-gray-700'>User Roles</h3>
        <form.Field name='roles'>
          {(field) => (
            <>
              <UserRolesSelector
                value={field.state.value}
                onChange={(roles: string[]) => field.handleChange(roles)}
              />
              {field.state.meta.touchedErrors?.length ? (
                <em className='mt-1 text-xs text-red-500'>
                  {field.state.meta.touchedErrors.join(', ')}
                </em>
              ) : null}
              {field.state.meta.errors.map((error) => (
                <p key={error as string} className='mt-1 text-xs text-red-500'>
                  {error}
                </p>
              ))}
            </>
          )}
        </form.Field>
      </div> */}

      <div className='mt-8 flex justify-end gap-3'>
        <Button
          type='button' // Para não submeter o form
          variant='outline'
          onClick={handleResetForm}
        >
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isValidating]}
        >
          {([canSubmit, isValidating]) => (
            <Button
              type='submit'
              disabled={!canSubmit || isPending || isValidating}
            >
              {isPending || isValidating ? (
                'Processing...'
              ) : (
                <>
                  <UserPlus className='mr-2 h-5 w-5' />
                  Create User
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export { UserForm };
