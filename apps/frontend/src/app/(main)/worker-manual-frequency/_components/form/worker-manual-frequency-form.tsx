'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import {
  FormCombobox,
  FormDatePicker,
  FormDropdownModal,
  FormInputField
  // FormDatePicker
} from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Save } from 'lucide-react';
import { IActionResultForm } from '@/types/types-server-actions';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import {
  IWorkerManualFrequency,
  IWorkerManualFrequencyAdd,
  IWorkerManualFrequencyEdit,
  IWorkerManualFrequencyRelatedData
} from '../../worker-manual-frequency-types';
// import { maskTimeInput } from '../../../../../lib/utils';

type WorkerManualFrequencyFormData<TMode extends 'add' | 'edit'> =
  TMode extends 'add' ? IWorkerManualFrequencyAdd : IWorkerManualFrequencyEdit;

export default function WorkerManualFrequencyForm<
  TMode extends 'add' | 'edit'
>({
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
  relatedData,
  isInDialog = false
}: {
  mode: TMode;
  defaultData: WorkerManualFrequencyFormData<TMode>;
  formActionProp: (
    prevState: IActionResultForm<
      WorkerManualFrequencyFormData<TMode>,
      IWorkerManualFrequency
    >,
    data: WorkerManualFrequencyFormData<TMode>
  ) => Promise<
    IActionResultForm<
      WorkerManualFrequencyFormData<TMode>,
      IWorkerManualFrequency
    >
  >;
  initialServerState?: IActionResultForm<
    WorkerManualFrequencyFormData<TMode>,
    IWorkerManualFrequency
  >;
  fieldLabels: { [k: string]: string };
  formSchema?: any;
  onCancel?: () => void;
  onClean?: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: IWorkerManualFrequencyRelatedData;
  isInDialog?: boolean;
}) {
  const [serverState, dispatchFormAction, isPending] = useActionState(
    formActionProp,
    initialServerState
  );

  const { listWorkers, listWorkerManualFrequencyTypes } = relatedData;

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    ),
    validators: formSchema ? { onChange: formSchema } : undefined,
    onSubmit: async ({
      value
    }: {
      value: WorkerManualFrequencyFormData<TMode>;
    }) => {
      await dispatchFormAction(formSchema.parse(value));
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
      <FormSuccessDisplay<
        WorkerManualFrequencyFormData<TMode>,
        IWorkerManualFrequency
      >
        serverState={serverState}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels}
        messageActions={{
          handleResetForm: 'Cadastrar nova frequência',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Criar Frequência' : 'Salvar Alterações');
  const CurrentSubmitButtonIcon =
    (SubmitButtonIcon && <SubmitButtonIcon className='mr-2 h-5 w-5' />) ||
    (mode === 'add' ? (
      <CalendarPlus className='mr-2 h-5 w-5' />
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
      <ErrorServerForm<WorkerManualFrequencyFormData<TMode>>
        serverState={serverState}
      />

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

      <form.Field
        name='userId'
        children={(field) => (
          <input
            type='hidden'
            value={field.state.value as any}
            name={field.name}
          />
        )}
      />

      <form.Field
        name='workerId'
        children={(field: any) => (
          <FormCombobox
            field={field}
            label={fieldLabels.workerId}
            placeholder='Selecione o colaborador'
            className='mb-4'
            options={listWorkers.map((worker) => ({
              value: String(worker.id),
              label: worker.name
            }))}
            onValueChange={(value) => field.handleChange(Number(value))}
          />
        )}
      />

      <div className='flex items-center justify-baseline gap-4'>
        <div className='flex-1'>
          <form.Field name='date'>
            {(field) => (
              <FormDatePicker
                field={field}
                label={fieldLabels.date}
                placeholder='dd/MM/yyyy'
                className='mb-4'
              />
            )}
          </form.Field>
        </div>
      </div>

      <form.Field
        name='workerManualFrequencyTypeId'
        children={(field: any) => (
          <FormDropdownModal
            field={field}
            label={fieldLabels.workerManualFrequencyTypeId}
            placeholder='Selecione o tipo de frequência'
            className='mb-4'
            options={listWorkerManualFrequencyTypes.map((type) => ({
              value: String(type.id),
              label: type.type
            }))}
            onValueChange={(value) => field.handleChange(Number(value))}
          />
        )}
      />

      <form.Field name='hours'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.hours}
            placeholder='Quantidade de horas'
            className='mb-4'
          />
        )}
      </form.Field>

      <form.Field name='notes'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.notes}
            placeholder='Digite uma observação'
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
