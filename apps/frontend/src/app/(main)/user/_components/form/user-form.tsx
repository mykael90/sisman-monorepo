// src/components/user-form.tsx
'use client';

import {
  FieldApi,
  mergeForm,
  useForm,
  useTransform
} from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, ReactNode, useActionState, useMemo } from 'react';

import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { UserPlus, Save, CheckSquare, Square } from 'lucide-react'; // Added CheckSquare, Square for header
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { FormSuccessDisplay } from '../../../../../components/form-tanstack/form-success-display';
import { ErrorServerForm } from '../../../../../components/form-tanstack/error-server-form';
import { IUserAdd } from '../../user-types';
import { IRoleList } from '../../../role/role-types'; // Ensure this can have { id: string|number, role: string, description?: string }

// Componente genérico UserForm
export default function UserForm({
  mode,
  defaultData,
  formActionProp,
  initialServerState = {
    isSubmitSuccessful: false,
    message: ''
  },
  fieldLabels,
  formSchema,
  onCancel,
  submitButtonText,
  SubmitButtonIcon,
  possibleRoles
}: UserFormProps) {
  const [serverState, formAction, isPending] = useActionState(
    formActionProp,
    initialServerState
  );

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    ),
    validators: formSchema ? { onChange: formSchema } : undefined
  });

  const handleResetOrCancel = () => {
    form.reset();
    onCancel();
  };

  useStore(form.store, (formState) => formState.errorsServer);

  if (serverState?.isSubmitSuccessful && serverState.responseData) {
    return (
      <FormSuccessDisplay
        serverState={serverState as IActionResultForm<object>}
        handleActions={{
          handleResetForm: handleResetOrCancel
        }}
        dataAddLabel={fieldLabels}
        messageActions={{
          handleResetForm: mode === 'add' ? 'Adicionar Outro' : 'Ir para lista'
        }}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Criar usuário' : 'Salvar Alterações');

  const CurrentSubmitButtonIcon =
    (SubmitButtonIcon && <SubmitButtonIcon className='mr-2 h-5 w-5' />) ||
    (mode === 'add' ? (
      <UserPlus className='mr-2 h-5 w-5' />
    ) : (
      <Save className='mr-2 h-5 w-5' />
    ));

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        form.handleSubmit();
      }}
      onReset={(e) => {
        e.preventDefault();
        handleResetOrCancel();
      }}
      className='rounded-lg bg-white p-6 shadow-md'
    >
      <ErrorServerForm serverState={serverState} />

      {mode === 'edit' && defaultData.id && (
        <form.Field
          name={'id' as any}
          children={(field) => (
            <input type='hidden' value={field.state.value} name={field.name} />
          )}
        />
      )}

      <form.Field name='name'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.name}
            placeholder='Digite o nome completo'
            className='mb-4'
          />
        )}
      </form.Field>

      <form.Field name='login'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.login}
            placeholder='Digite o login'
            className='mb-4'
          />
        )}
      </form.Field>

      <form.Field name='email'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.email}
            type='email'
            placeholder='Digite o email'
            className='mb-4'
          />
        )}
      </form.Field>

      {/* Roles Selection Field - STYLED TABLE SECTION */}
      <form.Field
        name='roles'
        mode='array'
        children={(field) => {
          const currentSelectedRoleObjects = field.state.value || [];

          return (
            <div>
              <label className='mb-3 block text-sm font-medium text-gray-700'>
                {fieldLabels.roles || 'Atribuir Funções'}
              </label>

              <div className='max-h-80 overflow-y-auto rounded-md border border-slate-300 bg-white shadow-sm'>
                {/* Table Header */}
                <div
                  className={`sticky top-0 z-10 grid grid-cols-[40px_50px_1fr_1.5fr] items-center gap-x-2 border-b border-slate-300 bg-slate-100 px-3 py-2.5 text-xs font-medium tracking-wider text-slate-600 uppercase sm:gap-x-4`}
                >
                  <div className='text-center'>Sel.</div>
                  <div className='text-left'>ID</div>
                  <div className='text-left'>Função</div>
                  <div className='text-left'>Descrição</div>
                </div>

                {/* Table Body */}
                {possibleRoles && possibleRoles.length > 0 ? (
                  <div className='divide-y divide-slate-200'>
                    {possibleRoles.map((role) => {
                      const roleId = String(role.id);
                      const isChecked = currentSelectedRoleObjects.some(
                        (selectedRole) => String(selectedRole.id) === roleId
                      );

                      return (
                        <label // The entire row is a label for the checkbox
                          key={role.id}
                          htmlFor={`role-${role.id}`}
                          className={`grid cursor-pointer grid-cols-[40px_50px_1fr_1.5fr] items-center gap-x-2 px-3 py-3 transition-colors duration-150 hover:bg-slate-50 has-[:checked]:bg-indigo-50 sm:gap-x-4`}
                        >
                          <div className='flex justify-center'>
                            <input
                              type='checkbox'
                              id={`role-${role.id}`}
                              name={field.name} // "roles"
                              value={roleId} // Sends the ID as string value
                              checked={isChecked}
                              onChange={(e) => {
                                let newSelectedRoleObjects: Array<{
                                  id: string;
                                }>;
                                if (e.target.checked) {
                                  newSelectedRoleObjects = [
                                    ...currentSelectedRoleObjects,
                                    { id: roleId }
                                  ];
                                } else {
                                  newSelectedRoleObjects =
                                    currentSelectedRoleObjects.filter(
                                      (selectedRole) =>
                                        selectedRole.id !== roleId
                                    );
                                }
                                field.handleChange(newSelectedRoleObjects);
                              }}
                              className='h-4 w-4 rounded border-gray-400 text-indigo-600 shadow-sm checked:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white'
                            />
                          </div>
                          <div className='truncate text-sm text-slate-600'>
                            {role.id}
                          </div>
                          <div className='truncate text-sm font-medium text-slate-800'>
                            {role.role}
                          </div>
                          <div className='truncate text-sm text-slate-600'>
                            {role.description || (
                              <span className='text-slate-400 italic'>
                                Sem descrição
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className='p-6 text-center text-sm text-slate-500'>
                    Nenhuma função disponível para seleção.
                  </p>
                )}
              </div>
              {field.getMeta().errors?.length ? (
                <div className='mt-3'>
                  {field
                    .getMeta()
                    .errors.map((error: string, index: number) => (
                      <em key={index} className='block text-xs text-red-600'>
                        {error}
                      </em>
                    ))}
                </div>
              ) : null}
            </div>
          );
        }}
      />

      <div className='mt-8 flex justify-end gap-3'>
        <Button type='button' variant='outline' onClick={handleResetOrCancel}>
          Cancelar
        </Button>
        <form.Subscribe
          selector={(state) => [
            state.canSubmit,
            state.isTouched,
            state.isValidating
          ]}
        >
          {([canSubmit, isTouched, isValidating]) => (
            <Button
              type='submit'
              disabled={
                !canSubmit ||
                isPending ||
                isValidating ||
                (mode === 'add' && !isTouched)
              }
            >
              {isPending || isValidating
                ? 'Processando...'
                : CurrentSubmitButtonIcon}
              {isPending || isValidating ? '' : currentSubmitButtonText}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

// Tipos genéricos para o formulário
interface UserFormProps {
  mode: 'add' | 'edit';
  defaultData: IUserAdd;
  formActionProp: (
    prevState: IActionResultForm<IUserAdd>,
    formData: FormData
  ) => Promise<IActionResultForm<IUserAdd>>;
  initialServerState?: IActionResultForm<IUserAdd>;
  fieldLabels: {
    [k: string]: string; // e.g., fieldLabels.roles = "Funções Atribuídas"
  };
  formSchema?: any;
  onCancel: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  /**
   * Lista de todas as funções possíveis que o usuário pode ter.
   * Assumes IRoleList objects have at least `id` and `role`, and optionally `description`.
   */
  possibleRoles?: IRoleList[];
}
