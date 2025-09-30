'use client';

import {
  mergeForm,
  useForm,
  useTransform,
  type DeepValue
} from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import {
  FormDropdownModal,
  FormInputField
} from '@/components/form-tanstack/form-input-fields';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserPlus, Save } from 'lucide-react'; // TODO: Change to WorkerPlus, Save
import { IActionResultForm } from '@/types/types-server-actions';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import {
  IWorker,
  IWorkerAdd,
  IWorkerEdit,
  IWorkerRelatedData,
  WorkerStatus
} from '../../worker-types';
import { WorkerAddSchema, WorkerEditSchema } from './worker-form-validation';
import { z } from 'zod';

// Helper type for form data based on mode
type WorkerFormData<TMode extends 'add' | 'edit'> = TMode extends 'add'
  ? IWorkerAdd
  : IWorkerEdit;

// Componente genérico WorkerForm
export default function WorkerForm<TMode extends 'add' | 'edit'>({
  mode,
  defaultData,
  formActionProp,
  initialServerState = {
    isSubmitSuccessful: false,
    message: ''
  },
  fieldLabels,
  onCancel,
  onClean,
  submitButtonText,
  SubmitButtonIcon,
  relatedData,
  isInDialog = false
}: {
  mode: TMode;
  defaultData: WorkerFormData<TMode>;
  formActionProp: (
    prevState: IActionResultForm<WorkerFormData<TMode>, IWorker>,
    data: WorkerFormData<TMode>
  ) => Promise<IActionResultForm<WorkerFormData<TMode>, IWorker>>;
  initialServerState?: IActionResultForm<WorkerFormData<TMode>, IWorker>;
  fieldLabels: {
    [k: string]: string;
  };
  onCancel?: () => void;
  onClean?: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: IWorkerRelatedData;
  isInDialog?: boolean;
}) {
  const [serverState, dispatchFormAction, isPending] = useActionState(
    formActionProp,
    initialServerState
  );

  const {
    listContracts,
    listWorkerSpecialties,
    listMaintenanceInstances,
    listSipacUnidades
  } = relatedData;

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    ),
    // validators: undefined, // Remove global validator
    onSubmit: async ({ value }: { value: WorkerFormData<TMode> }) => {
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
    return (
      <FormSuccessDisplay<WorkerFormData<TMode>, IWorker>
        serverState={serverState}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels}
        messageActions={{
          handleResetForm: 'Cadastrar novo worker',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Criar colaborador' : 'Salvar Alterações');

  const CurrentSubmitButtonIcon =
    (SubmitButtonIcon && <SubmitButtonIcon className='mr-2 h-5 w-5' />) ||
    (mode === 'add' ? (
      <UserPlus className='mr-2 h-5 w-5' /> // TODO: Change to WorkerPlus icon
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
      <ErrorServerForm<WorkerFormData<TMode>> serverState={serverState} />

      {mode === 'edit' && 'id' in defaultData && defaultData.id && (
        <form.Field
          name='id'
          children={(field) => (
            <input
              type='hidden'
              value={field.state.value as any}
              name={field.name}
            />
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

      <div className='flex items-center justify-baseline gap-4'>
        <div className='flex-1'>
          <form.Field name='cpf'>
            {(field) => (
              <FormInputField
                field={field}
                label={fieldLabels.cpf}
                placeholder='Digite o CPF'
                className='mb-4'
              />
            )}
          </form.Field>
        </div>
        {mode === 'edit' && 'status' in defaultData && (
          <div className='flex'>
            <form.Field name='status'>
              {(field) => (
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='status'
                    checked={field.state.value === true}
                    onCheckedChange={(checked) =>
                      field.handleChange(
                        (checked ? true : false) as DeepValue<
                          WorkerFormData<TMode>,
                          'status'
                        >
                      )
                    }
                  />
                  <Label htmlFor='status'>
                    {field.state.value === true ? 'Ativo' : 'Inativo'}
                  </Label>
                </div>
              )}
            </form.Field>
          </div>
        )}
      </div>

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

      <form.Field name='phone'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.phone}
            placeholder='Digite o telefone'
            className='mb-4'
          />
        )}
      </form.Field>

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
