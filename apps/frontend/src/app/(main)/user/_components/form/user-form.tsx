// src/components/user-form.tsx
'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import {
  FormInputCheckbox,
  FormInputField
} from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { UserPlus, Save } from 'lucide-react';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { FormSuccessDisplay } from '../../../../../components/form-tanstack/form-success-display';
import { ErrorServerForm } from '../../../../../components/form-tanstack/error-server-form';
import { IUser, IUserAdd, IUserEdit } from '../../user-types'; // Added IUser, IUserEdit
import { IRoleList } from '../../../role/role-types';

// Helper type for form data based on mode
type UserFormData<TMode extends 'add' | 'edit'> = TMode extends 'add'
  ? IUserAdd
  : IUserEdit;

// Componente genérico UserForm
export default function UserForm<TMode extends 'add' | 'edit'>({
  // Made generic
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
  onClean,
  submitButtonText,
  SubmitButtonIcon,
  possibleRoles,
  isInDialog = false
}: {
  // Explicitly defining props for the generic component
  mode: TMode;
  defaultData: UserFormData<TMode>;
  formActionProp: (
    prevState: IActionResultForm<UserFormData<TMode>, IUser>, // Adjusted prevState type
    data: UserFormData<TMode> // Data is now an object
  ) => Promise<IActionResultForm<UserFormData<TMode>, IUser>>;
  initialServerState?: IActionResultForm<UserFormData<TMode>, IUser>;
  fieldLabels: {
    [k: string]: string;
  };
  formSchema?: any;
  onCancel?: () => void;
  onClean?: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  possibleRoles?: IRoleList[];
  isInDialog?: boolean;
}) {
  const [serverState, dispatchFormAction, isPending] = useActionState(
    formActionProp,
    initialServerState
  );

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    ),
    validators: formSchema ? { onChange: formSchema } : undefined,
    // Add onSubmit to get validated values
    onSubmit: async ({ value }: { value: UserFormData<TMode> }) => {
      // `value` is the validated form data as an object
      // `dispatchFormAction` is the function returned by `useActionState`
      // It expects the new "payload" as its argument.
      // The `prevState` is managed internally by `useActionState`.
      console.log('Form submitted with values:', value);
      await dispatchFormAction(value);
    }
  });

  const handleReset = onClean
    ? () => {
        form.reset();
        onClean && onClean();
      }
    : undefined;

  const handleCancel = () => {
    onCancel && onCancel();
  };

  useStore(form.store, (formState) => formState.errorsServer);

  if (serverState?.isSubmitSuccessful && serverState.responseData) {
    // serverState.responseData ensures we have something for IUser
    return (
      <FormSuccessDisplay<UserFormData<TMode>, IUser> // Specify both generics
        serverState={serverState} // serverState is IActionResultForm<UserFormData<TMode>, IUser>
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels} // This will be used to pick fields from Partial<IUser>
        messageActions={{
          handleResetForm: 'Cadastrar novo usuário',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
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
      // Removed action={dispatchFormAction}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation(); // Good practice with manual handleSubmit
        form.handleSubmit(); // This will call the `onSubmit` defined in `useForm` options
      }}
      onReset={(e) => {
        e.preventDefault();
        handleReset && handleReset();
      }}
      className='rounded-lg bg-white p-6 shadow-md'
    >
      <ErrorServerForm<UserFormData<TMode>> serverState={serverState} />

      {/* Conditionally render ID field if mode is 'edit' and id exists in defaultData */}
      {mode === 'edit' && 'id' in defaultData && defaultData.id && (
        <form.Field
          name='id' // Still need to cast to any if 'id' isn't in all UserFormData versions
          children={(field) => (
            <input
              type='hidden'
              value={field.state.value as any}
              name={field.name}
            />
          )}
        />
      )}
      {/* Conditionally render ID field if mode is 'edit' and id exists in defaultData */}
      {mode === 'edit' && 'id' in defaultData && defaultData.id && (
        <div className='flex h-8 flex-row items-center justify-end gap-2'>
          <div className='text-sm font-medium text-indigo-600'>
            Usuário Ativo{' '}
          </div>
          <form.Field name='isActive'>
            {(field) => (
              <FormInputCheckbox
                field={field} // Cast if TS complains
                label={fieldLabels.isActive}
                className=''
                type='checkbox'
                showLabel={false}
              />
            )}
          </form.Field>
        </div>
      )}

      <form.Field name='name'>
        {(field) => (
          <FormInputField
            field={field} // Cast if TS complains
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
          const currentSelectedRoleObjects =
            (field.state.value as Array<{ id: number }>) || [];

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
                      const roleId = role.id;
                      const isChecked = currentSelectedRoleObjects.some(
                        (selectedRole) => selectedRole.id === roleId
                      );

                      return (
                        <label
                          key={role.id}
                          htmlFor={`role-${role.id}`}
                          className={`grid cursor-pointer grid-cols-[40px_50px_1fr_1.5fr] items-center gap-x-2 px-3 py-3 transition-colors duration-150 hover:bg-slate-50 has-[:checked]:bg-indigo-50 sm:gap-x-4`}
                        >
                          <div className='flex justify-center'>
                            <input
                              type='checkbox'
                              id={`role-${role.id}`}
                              name={field.name}
                              value={roleId}
                              checked={isChecked}
                              onChange={(e) => {
                                let newSelectedRoleObjects: Array<{
                                  id: number;
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
                                field.handleChange(
                                  newSelectedRoleObjects as any
                                );
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
        {mode === 'add' && (
          <Button type='button' variant='outline' onClick={handleReset}>
            Limpar
          </Button>
        )}
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
                isPending || // from useActionState
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
