'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';

import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { ShieldPlus, Save } from 'lucide-react'; // Ícones para Role
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { FormSuccessDisplay } from '../../../../../components/form-tanstack/form-success-display';
import { ErrorServerForm } from '../../../../../components/form-tanstack/error-server-form';
import { IRoleAdd, IRoleEdit } from '../../role-types'; // Tipos específicos de Role

interface RoleFormProps {
  mode: 'add' | 'edit';
  defaultData: IRoleAdd | IRoleEdit; // Aceita tanto para adicionar quanto para editar
  formActionProp: (
    prevState: IActionResultForm<IRoleAdd | IRoleEdit>,
    formData: FormData
  ) => Promise<IActionResultForm<IRoleAdd | IRoleEdit>>;
  initialServerState?: IActionResultForm<IRoleAdd | IRoleEdit>;
  fieldLabels: Partial<Record<keyof (IRoleAdd & IRoleEdit), string>>; // Labels para os campos
  formSchema?: any; // Schema de validação Zod (roleFormSchemaAdd ou roleFormSchemaEdit)
  onCancel: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
}

export default function RoleForm({
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
  SubmitButtonIcon
}: RoleFormProps) {
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
        dataAddLabel={fieldLabels as Record<string, string>}
        messageActions={{
          handleResetForm:
            mode === 'add' ? 'Adicionar Outro Papel' : 'Ir para lista'
        }}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText || (mode === 'add' ? 'Criar Papel' : 'Salvar Alterações');

  const CurrentSubmitButtonIcon =
    (SubmitButtonIcon && <SubmitButtonIcon className='mr-2 h-5 w-5' />) ||
    (mode === 'add' ? (
      <ShieldPlus className='mr-2 h-5 w-5' />
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

      {mode === 'edit' && 'id' in defaultData && defaultData.id && (
        <form.Field
          name={'id'}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore next line
          children={(field) => (
            <input type='hidden' value={field.state.value} name={field.name} />
          )}
        />
      )}

      <form.Field name='role'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.role || 'Nome do Papel'}
            placeholder='Ex: ADMINISTRATOR, EDITOR_CHEFE'
            className='mb-4'
          />
        )}
      </form.Field>

      <form.Field name='description'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.description || 'Descrição'}
            placeholder='Descreva a finalidade deste papel'
            className='mb-4'
            isTextArea={true} // Se quiser um textarea para descrição
          />
        )}
      </form.Field>

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
