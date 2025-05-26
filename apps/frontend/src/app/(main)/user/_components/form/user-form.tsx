// src/components/user-form.tsx
'use client';

import {
  FieldApi,
  mergeForm,
  useForm,
  useTransform
} from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, ReactNode, useActionState, useState } from 'react'; // Removido useRef, useState (não usados diretamente aqui)

import { FormInputField } from '@/components/form-tanstack/form-input-fields'; // Ajuste o caminho
import { Button } from '@/components/ui/button'; // Ajuste o caminho
import { UserPlus, Save } from 'lucide-react'; // Adicionado Save icon
import { IActionResultForm } from '../../../../../types/types-server-actions'; // Ajuste o caminho
import { FormSuccessDisplay } from '../../../../../components/form-tanstack/form-success-display'; // Ajuste o caminho
import { ErrorServerForm } from '../../../../../components/form-tanstack/error-server-form'; // Ajuste o caminho
import { IUserAdd } from '../../user-types';
import { IRoleList } from '../../../role/role-types';
// import { UserAddAvatar } from './user-add-avatar'; // Comentado, adicionar se necessário
// import userFormSchema from './users-validation-form'; // Será passado como prop

// Componente genérico UserForm
export default function UserForm({
  mode,
  defaultData,
  formActionProp,
  initialServerState = {
    isSubmitSuccessful: false,
    message: ''
  }, // Estado inicial padrão
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

  const [selectableRoles, setSelectableRoles] = useState(possibleRoles);

  const form = useForm({
    // TData is inferred from defaultData (IUserAdd), TFormValidator is any for schema
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      // TODO: Consider if serverState should also be typed with TData or a partial of it
      [serverState]
    ),
    validators: formSchema ? { onChange: formSchema } : undefined // Aplicar schema se fornecido
    // validatorAdapter: zodValidator, // Se estiver usando Zod
  });

  const handleResetOrCancel = () => {
    form.reset();
    onCancel();
  };

  // useStore para observar erros do servidor no estado do formulário
  useStore(form.store, (formState) => formState.errorsServer); // Ou formState.errors para erros de campo

  if (serverState?.isSubmitSuccessful && serverState.responseData) {
    return (
      <FormSuccessDisplay
        serverState={serverState as IActionResultForm<object>} // Cast para o tipo esperado por FormSuccessDisplay
        handleActions={{
          handleResetForm: handleResetOrCancel // Para "Adicionar Outro" ou "Continuar Editando"
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
      action={formAction} // Server action do useActionState
      onSubmit={(e) => {
        // e.preventDefault(); // Não é necessário com action={formAction}
        form.handleSubmit(); // Validações do TanStack Form
      }}
      onReset={(e) => {
        e.preventDefault();
        handleResetOrCancel();
      }}
      className='rounded-lg bg-white p-6 shadow-md'
    >
      <ErrorServerForm serverState={serverState} />

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

      {/* Debug: Mostrar estados na tela */}

      {/* <div className='bg-red-100'>
        {Object.entries(form.state).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {JSON.stringify(value, null, 2)}
          </div>
        ))}
      </div>

      <div className='bg-blue-100'>
        {Object.entries(serverState).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {JSON.stringify(value, null, 2)}
          </div>
        ))}
      </div> */}

      {/* Campo ID oculto para o modo de edição */}
      {mode === 'edit' && defaultData.id && (
        <form.Field
          name={'id' as any} // TanStack Form pode precisar de 'id' no TData
          // Se 'id' não estiver em TData formalmente, mas presente em defaultData para edição:
          // É melhor garantir que TData inclua 'id' se for relevante para o formulário.
          // Para este exemplo, assumimos que TData pode ter 'id'.
          children={(field) => (
            <input type='hidden' value={field.state.value} name={field.name} />
          )}
        />
      )}

      <form.Field name='name'>
        {(field) => (
          <>
            <FormInputField
              field={field}
              label={fieldLabels.name}
              placeholder='Digite o nome completo'
              className='mb-4'
            />
            {/* {JSON.stringify(field.getMeta(), null, 2)} */}
          </>
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

      {/* Roles Selection Field */}
      {/* Ensure IUserAdd includes `roles?: string[]` or `roles?: number[]` */}
      <form.Field
        name='roles'
        mode='array'
        children={(field) => {
          // field.state.value é esperado ser Array<{ id: string }> | undefined
          // com base na tipagem de IUserAdd['roles'] e defaultData.roles
          const currentSelectedRoleObjects = field.state.value || [];

          return (
            <div className='mb-4'>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                {fieldLabels.roles || 'Funções'}
              </label>
              {selectableRoles && selectableRoles.length > 0 ? (
                <div className='space-y-2'>
                  {selectableRoles.map((role) => {
                    const roleId = String(role.id); // ID da role atual (string)
                    const isChecked = currentSelectedRoleObjects.some(
                      (selectedRole) => String(selectedRole.id) === roleId
                    );

                    return (
                      <label
                        key={role.id}
                        htmlFor={`role-${role.id}`}
                        className='flex cursor-pointer items-center'
                      >
                        <input
                          type='checkbox'
                          id={`role-${role.id}`}
                          name={field.name} // Importante: "roles" para o FormData
                          value={`{id: ${roleId}}`} // Valor enviado no FormData (string ID)
                          checked={isChecked}
                          onChange={(e) => {
                            let newSelectedRoleObjects: Array<{ id: string }>;
                            if (e.target.checked) {
                              newSelectedRoleObjects = [
                                ...currentSelectedRoleObjects,
                                { id: roleId } // Armazena como objeto no estado do formulário
                              ];
                            } else {
                              newSelectedRoleObjects =
                                currentSelectedRoleObjects.filter(
                                  (selectedRole) => selectedRole.id !== roleId
                                );
                            }
                            field.handleChange(newSelectedRoleObjects);
                          }}
                          className='mr-3 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                        />
                        <span className='text-sm text-gray-900'>
                          {role.role}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className='text-sm text-gray-500'>
                  Nenhuma função disponível para seleção.
                </p>
              )}
              {field.getMeta().errors?.length
                ? field.getMeta().errors.map((error: string, index: number) => (
                    <em key={index} className='mt-1 text-xs text-red-500'>
                      {error}
                    </em>
                  ))
                : null}
            </div>
          );
        }}
      />

      <div className='mt-8 flex justify-end gap-3'>
        {' '}
        {/* Increased top margin if roles section is substantial */}
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
              // Em modo de edição, pode desabilitar se nada foi tocado (isTouched)
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
// TData representa a estrutura dos dados do formulário (ex: IUser, IUserAdd)
// TServerResultData representa a estrutura dos dados retornados pelo servidor (pode ser igual a TData)
interface UserFormProps {
  mode: 'add' | 'edit';
  /**
   * Dados iniciais para o formulário.
   * Para 'add', pode ser um objeto com valores padrão.
   * Para 'edit', deve ser o objeto do usuário a ser editado (incluindo o 'id' e 'roles' preenchidos).
   */
  defaultData: IUserAdd;
  /**
   * A server action a ser chamada (addUserAction, editUserAction, etc.).
   * Deve aceitar (prevState, formData) e retornar Promise<IActionResultForm<TServerResultData>>.
   */
  formActionProp: (
    prevState: IActionResultForm<IUserAdd>,
    formData: FormData
  ) => Promise<IActionResultForm<IUserAdd>>;
  /**
   * Estado inicial para `useActionState`.
   */
  initialServerState?: IActionResultForm<IUserAdd>;
  /**
   * Labels para os campos do formulário e para exibição no FormSuccessDisplay.
   * As chaves devem corresponder às chaves de TData (e.g., 'name', 'login', 'email', 'roles').
   */
  fieldLabels: {
    [k: string]: string;
  };
  /**
   * Esquema de validação para o TanStack Form (ex: objeto de validadores ou schema Zod adaptado).
   */
  formSchema?: any; // Seja mais específico se souber o tipo do schema (ex: typeof userFormSchema)
  /**
   * Chamado quando o usuário clica em "Cancelar" ou após um sucesso para resetar/fechar o formulário.
   */
  onCancel: () => void;
  /**
   * Texto customizado para o botão de submissão.
   */
  submitButtonText?: string;
  /**
   * Ícone customizado para o botão de submissão.
   */
  SubmitButtonIcon?: FC<{ className?: string }>;

  /**
   * Lista de todas as funções possíveis que o usuário pode ter.
   */
  possibleRoles?: IRoleList[];
}
