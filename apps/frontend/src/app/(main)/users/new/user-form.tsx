import React from 'react';
import { UserAvatar } from './user-avatar';
import { UserRolesSelector } from './users-rolers-selector'; // Corrigido: users-roles-selector
import { Button } from '@/components/ui/button';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { UserFormData } from './user';
import { createUserAction, CreateUserActionResult } from './actions'; // Importe a server action
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { addUser } from '../_actions';

// (Opcional: Zod para validação client-side, pode ser o mesmo schema do server)
// import { zodValidator } from '@tanstack/zod-form-adapter';
// import { z } from 'zod';
// const clientUserFormSchema = z.object({ ... }); // O mesmo schema ou um subconjunto

interface UserFormProps {
  // onSubmit é removido se a navegação/feedback de sucesso for tratado internamente
  // ou pode ser mantido para ações pós-sucesso no componente pai
  onSuccess?: (data: UserFormData) => void;
}

function UserForm({ onSuccess }: UserFormProps) {
  const router = useRouter();

  const form = useForm({
    // O segundo tipo genérico é para o retorno do onSubmit
    defaultValues: {
      name: '',
      login: '',
      email: '',
      roles: [],
      avatarUrl: ''
    },
    // validatorAdapter: zodValidator, // Para validação client-side com Zod
    // clientValidation: clientUserFormSchema, // Se estiver usando Zod

    onSubmit: async ({ value }) => {
      // 'value' contém os dados do formulário (potencialmente validados no cliente)
      const result = await addUser(value);

      if (!result.success) {
        const errorsToSet: Partial<
          Record<keyof UserFormData | 'FORM', string[]>
        > = {};
        if (result.errors) {
          for (const key in result.errors) {
            errorsToSet[key as keyof UserFormData] =
              result.errors[key as keyof UserFormData];
          }
        }
        if (result.formErrors && result.formErrors.length > 0) {
          errorsToSet.FORM = result.formErrors;
        }
        if (result.message && !result.errors && !result.formErrors) {
          errorsToSet.FORM = [result.message]; // Mensagem geral como erro de formulário
        }
        console.log(errorsToSet);
        // form.setErrors(errorsToSet); // Define erros retornados pelo servidor
        // Você também pode usar form.setServerErrors(result.errors) se o formato corresponder
        // ou individualmente: field.setError("Server error message")
      } else {
        // Sucesso!
        console.log(result.message);
        form.reset(); // Limpa o formulário
        if (onSuccess && result.createdUser) {
          onSuccess(result.createdUser);
        }
        // Exemplo: redirecionar ou mostrar notificação de sucesso
        // router.push('/users');
        // alert(result.message); // Ou use um componente de toast/notificação
      }
      return result; // Retorna o resultado da action, pode ser útil
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit(); // Isso irá executar validações client-side (se houver)
        // e então chamar o onSubmit definido em useForm
      }}
      className='rounded-lg bg-white p-6 shadow-md'
    >
      {/* Exibe erros gerais do formulário */}
      <form.Subscribe selector={(state) => state.errors}>
        {(errors) =>
          errors && errors.FORM && errors.FORM.length > 0 ? (
            <div className='mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700'>
              <div className='flex items-center'>
                <AlertCircle className='mr-2 h-5 w-5' />
                <strong>Error:</strong>
              </div>
              <ul className='mt-1 ml-5 list-inside list-disc'>
                {errors.FORM.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          ) : null
        }
      </form.Subscribe>

      {/* <form.Field
        name='avatarUrl'
        children={(field) => (
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
          </div>
        )}
      /> */}

      <form.Field
        name='name'
        // validators={{ onChange: clientUserFormSchema?.shape.name }} // Validação client-side
        children={(field) => (
          <FormInputField
            field={field}
            label='Full Name'
            placeholder='Enter full name'
          />
        )}
      />
      <form.Field
        name='login'
        children={(field) => (
          <FormInputField
            field={field}
            label='Login'
            placeholder='Enter login'
          />
        )}
      />
      <form.Field
        name='email'
        children={(field) => (
          <FormInputField
            field={field}
            label='Email'
            type='email'
            placeholder='Enter email address'
          />
        )}
      />

      {/* <div className='mt-6'>
        <h3 className='mb-2 text-sm font-medium text-gray-700'>User Roles</h3>
        <form.Field
          name='roles'
          children={(field) => (
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
            </>
          )}
        />
      </div> */}

      <div className='mt-8 flex justify-end gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={() => {
            form.reset(); // Opcional: resetar ao cancelar
            router.push('/users');
          }}
        >
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => [
            state.canSubmit,
            state.isSubmitting,
            state.isValidating
          ]}
          children={([canSubmit, isSubmitting, isValidating]) => (
            <Button
              type='submit'
              disabled={!canSubmit || isSubmitting || isValidating}
              className='bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
            >
              {isSubmitting || isValidating ? (
                'Processing...'
              ) : (
                <>
                  <UserPlus className='mr-2 h-5 w-5' />
                  Create User
                </>
              )}
            </Button>
          )}
        />
      </div>
    </form>
  );
}

export { UserForm };
