import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { CirclePlus, Save } from 'lucide-react'; // Using CirclePlus and Save icons
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import { IRole, IRoleAdd, IRoleEdit } from '../../role-types';

// Helper type for form data based on mode
type RoleFormData<TMode extends 'add' | 'edit'> = TMode extends 'add'
  ? IRoleAdd
  : IRoleEdit;

// Componente genérico RoleForm
export default function RoleForm<TMode extends 'add' | 'edit'>({
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
  isInDialog = false
}: {
  mode: TMode;
  defaultData: RoleFormData<TMode>;
  formActionProp: (
    prevState: IActionResultForm<RoleFormData<TMode>, IRole>,
    data: RoleFormData<TMode>
  ) => Promise<IActionResultForm<RoleFormData<TMode>, IRole>>;
  initialServerState?: IActionResultForm<RoleFormData<TMode>, IRole>;
  fieldLabels: {
    [k: string]: string;
  };
  formSchema?: any; // Zod schema type
  onCancel?: () => void;
  onClean?: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
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
    onSubmit: async ({ value }: { value: RoleFormData<TMode> }) => {
      console.log('Role Form submitted with values:', value);
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
    return (
      <FormSuccessDisplay<RoleFormData<TMode>, IRole>
        serverState={serverState}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels}
        messageActions={{
          handleResetForm: 'Cadastrar novo papel',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText || (mode === 'add' ? 'Criar Papel' : 'Salvar Alterações');

  const CurrentSubmitButtonIcon =
    (SubmitButtonIcon && <SubmitButtonIcon className='mr-2 h-5 w-5' />) ||
    (mode === 'add' ? (
      <CirclePlus className='mr-2 h-5 w-5' />
    ) : (
      <Save className='mr-2 h-5 w-5' />
    ));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      onReset={(e) => {
        e.preventDefault();
        handleReset && handleReset();
      }}
      className='rounded-lg bg-white p-6 shadow-md'
    >
      <ErrorServerForm<RoleFormData<TMode>> serverState={serverState} />

      <form.Field
        name='id'
        children={(field) => (
          <FormInputField
            field={field as any} // Cast needed due to generic type complexity
            label={fieldLabels.id}
            placeholder='Ex: 100'
            className='mb-4'
            disabled={mode === 'edit'}
          />
        )}
      />

      <form.Field name='role'>
        {(field) => (
          <FormInputField
            field={field as any} // Cast needed due to generic type complexity
            label={fieldLabels.role}
            placeholder='Ex: ADMIN_USER'
            className='mb-4'
          />
        )}
      </form.Field>

      <form.Field name='description'>
        {(field) => (
          <FormInputField
            field={field as any} // Cast needed due to generic type complexity
            label={fieldLabels.description}
            placeholder='Descrição detalhada do papel'
            className='mb-4'
          />
        )}
      </form.Field>

      {/* No roles selector or isActive for roles */}

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
