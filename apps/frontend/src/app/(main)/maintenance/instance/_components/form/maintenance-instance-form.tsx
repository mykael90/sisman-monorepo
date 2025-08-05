'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import type { IActionResultForm } from '../../../../../../types/types-server-actions';
import type {
  MaintenanceInstanceAdd,
  MaintenanceInstanceEdit
} from '../../maintenance-instance-types';
import { FilePlus, Save } from 'lucide-react';

type MaintenanceInstanceFormData<TMode extends 'add' | 'edit'> =
  TMode extends 'add' ? MaintenanceInstanceAdd : MaintenanceInstanceEdit;

export default function MaintenanceInstanceForm<TMode extends 'add' | 'edit'>({
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
  isInDialog = false,
  submitButtonText,
  SubmitButtonIcon
}: {
  mode: TMode;
  defaultData: MaintenanceInstanceFormData<TMode>;
  formActionProp: (
    prevState: IActionResultForm<MaintenanceInstanceFormData<TMode>, any>,
    data: MaintenanceInstanceFormData<TMode>
  ) => Promise<IActionResultForm<MaintenanceInstanceFormData<TMode>, any>>;
  initialServerState?: IActionResultForm<
    MaintenanceInstanceFormData<TMode>,
    any
  >;
  fieldLabels: {
    [k: string]: string;
  };
  formSchema?: any; // Zod schema type
  onCancel?: () => void;
  onClean?: () => void;
  isInDialog?: boolean;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
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
    onSubmit: async ({
      value
    }: {
      value: MaintenanceInstanceFormData<TMode>;
    }) => {
      console.log('Maintenance Instance Form submitted with values:', value);
      await dispatchFormAction(value);
    }
  });

  const handleReset = onClean
    ? () => {
        form.reset();
        onClean?.();
      }
    : undefined;

  const handleCancel = () => {
    onCancel && onCancel();
  };

  useStore(form.store, (formState) => formState.errorsServer);

  if (serverState?.isSubmitSuccessful) {
    return (
      <FormSuccessDisplay
        serverState={serverState}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels}
        messageActions={{
          handleResetForm: 'Cadastrar nova instância de manutenção',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Criar Instância' : 'Salvar Alterações');

  const CurrentSubmitButtonIcon =
    (SubmitButtonIcon && <SubmitButtonIcon className='mr-2 h-5 w-5' />) ||
    (mode === 'add' ? (
      <FilePlus className='mr-2 h-5 w-5' />
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
      <ErrorServerForm serverState={serverState} />

      <form.Field
        name='name'
        children={(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.name}
            placeholder='Digite o nome da instância'
            className='mb-4'
          />
        )}
      />

      <form.Field
        name='sipacId'
        children={(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.sipacId}
            placeholder='Digite o código SIPAC'
          />
        )}
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
