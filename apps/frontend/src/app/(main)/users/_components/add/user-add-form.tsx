// src/components/user-form.tsx
'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { useActionState, useRef, useState } from 'react';

// Seus componentes e tipos
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { addUser } from '../../users-actions';
import { IUserAdd } from '../../users-types';
import { FormSuccessDisplay } from '../../../../../components/form-tanstack/form-success-display';
import { ErrorServerForm } from '../../../../../components/form-tanstack/error-server-form';
import { UserAddAvatar } from './user-add-avatar';
import { UserRolesSelector } from './users-rolers-selector';
import userFormSchema from './users-validation-form';

// (Opcional: Zod para validação client-side)
// import { zodValidator } from '@tanstack/zod-form-adapter';
// import { z } from 'zod';
// const clientUserFormSchema = z.object({ ... }); // Schema Zod para cliente

function UserAddForm({
  onWantToReset,
  defaultData,
  initialServerState = {
    errorsServer: [],
    message: ''
  }
}: {
  onWantToReset: () => void;
  defaultData: IUserAdd;
  initialServerState: IActionResultForm<IUserAdd>;
}) {
  // useActionState para interagir com a Server Action
  // O tipo de serverState será inferido de ICreateUserActionResult

  const [serverState, formAction, isPending] = useActionState(
    addUser,
    initialServerState
  );

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}), // serverState aqui é CreateUserActionResult
      [serverState]
    ),
    validators: {
      // onChange: userFormSchema
      onBlur: userFormSchema
    }
  });
  const handleResetForm = () => {
    form.reset(); // 1. Reseta o estado interno do TanStack Form para defaultValues
    // 2. Mudar a key força a recriação do <form> e de seus hooks internos,
    //    incluindo a reinicialização do useActionState para myInitialServerState.
    onWantToReset();
  };

  // validatorAdapter: zodValidator, // Para validação client-side com Zod
  // clientValidation: clientUserFormSchema, // Se estiver usando Zod

  // A action é chamada pelo atributo 'action' do <form> HTML.
  // Mas podemos manter um onSubmit para lógica client-side se necessário ANTES da action.
  // No entanto, com o padrão server action, é mais comum não ter um onSubmit aqui.
  // A validação do TanStack Form ainda roda antes da server action ser chamada.

  // Lógica que executa na renderização se houver um novo estado de sucesso
  // TODO:

  //sempre que formState.errorsServer muda dentro do estado do form.store, o formulário é renderizado novamente
  useStore(form.store, (formState) => formState.errorsServer);

  // // Se a submissão foi bem-sucedida, mostramos uma mensagem e um botão para adicionar outro.
  if (serverState?.isSubmitSuccessful) {
    // Os valores do formulário já devem ter sido "resetados" pelo mergeForm
    // usando o `submittedData` (que eram os defaultValues) da action.
    return (
      <FormSuccessDisplay
        serverState={serverState}
        handleActions={{
          handleResetForm
        }}
      />
    );
  }
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
      {/* Exibir a mensagem geral de erro do servidor */}
      <ErrorServerForm serverState={serverState} />

      {/* <div className='bg-red-100'>
        {Object.entries(form.state).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {JSON.stringify(value, null, 2)}
          </div>
        ))}
      </div> */}

      {/* <div className='bg-blue-100'>
        {Object.entries(serverState).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {JSON.stringify(value, null, 2)}
          </div>
        ))}
      </div> */}

      {/* Avaliar se é necessário erro geral do formulário Tanstack no lado cliente) */}

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
          <>
            <FormInputField
              field={field}
              label='Nome Completo'
              placeholder='Digite o nome completo'
            />
            {/* {JSON.stringify(field.getMeta(), null, 2)} */}
          </>
        )}
      </form.Field>

      <form.Field name='login'>
        {(field) => (
          <FormInputField
            field={field}
            label='Login'
            placeholder='Digite o login'
          />
        )}
      </form.Field>

      <form.Field name='email'>
        {(field) => (
          <FormInputField
            field={field}
            label='Email'
            type='email'
            placeholder='Digite o email'
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
          selector={(state) => [
            state.canSubmit,
            state.isValidating,
            state.isTouched
          ]}
        >
          {([canSubmit, isValidating, isTouched]) => (
            <Button
              type='submit'
              disabled={!canSubmit || isPending || isValidating || !isTouched}
            >
              {isPending || isValidating ? (
                'Processando...'
              ) : (
                <>
                  <UserPlus className='mr-2 h-5 w-5' />
                  Criar usuário
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export { UserAddForm as UserForm };
