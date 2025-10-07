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
import * as React from 'react';
import {
  IWorkerManualFrequency,
  IWorkerManualFrequencyAddBulkForm,
  IWorkerManualFrequencyAdd,
  IWorkerManualFrequencyRelatedData
} from '../../worker-manual-frequency-types';
import { TableFormFrequencyItems } from './table-form-frequency-items';
// import { maskTimeInput } from '../../../../../lib/utils';

export default function WorkerManualFrequencyFormBulk({
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
  defaultData: IWorkerManualFrequencyAddBulkForm;
  formActionProp: (
    prevState: IActionResultForm<
      IWorkerManualFrequencyAddBulkForm,
      IWorkerManualFrequency
    >,
    data: IWorkerManualFrequencyAddBulkForm
  ) => Promise<
    IActionResultForm<IWorkerManualFrequencyAddBulkForm, IWorkerManualFrequency>
  >;
  initialServerState?: IActionResultForm<
    IWorkerManualFrequencyAddBulkForm,
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
      value: IWorkerManualFrequencyAddBulkForm;
    }) => {
      // await dispatchFormAction(formSchema.parse(value));
      console.log(value);
    }
  });

  const handleAddFrequency = () => {
    const { items: _, ...rest } = form.state.values;
    const newKey = Date.now() + Math.random(); // Revertido para Date.now() + Math.random()

    const newFrequencyItem: IWorkerManualFrequencyAdd & { key: number } = {
      key: newKey,
      date: rest.date,
      hours: rest.hours,
      workerManualFrequencyTypeId: rest.workerManualFrequencyTypeId,
      notes: rest.notes,
      workerId: rest.workerId,
      userId: rest.userId
      // workerContractId: rest.workerContractId,
    };

    form.pushFieldValue('items', newFrequencyItem);
  };

  const handleRemoveFrequency = (key: number) => {
    const index = (
      form.state.values.items as (IWorkerManualFrequencyAdd & { key: number })[]
    ).findIndex((item) => item.key === key);
    if (index !== -1) {
      form.removeFieldValue('items', index);
    }
  };

  const handleUpdateFrequencyField = (
    key: number,
    fieldToUpdate: keyof IWorkerManualFrequencyAdd,
    value: any
  ) => {
    const index = form.state.values.items.findIndex(
      (item: IWorkerManualFrequencyAdd & { key: number }) => item.key === key
    );
    if (index !== -1) {
      const updatedItem = {
        ...form.state.values.items[index],
        [fieldToUpdate]: value
      };
      form.replaceFieldValue('items', index, updatedItem);
    }
  };

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
        IWorkerManualFrequencyAddBulkForm,
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

  const currentSubmitButtonText = submitButtonText || 'Criar Frequência';
  const CurrentSubmitButtonIcon = (SubmitButtonIcon && (
    <SubmitButtonIcon className='mr-2 h-5 w-5' />
  )) || <CalendarPlus className='mr-2 h-5 w-5' />;

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
      <ErrorServerForm<IWorkerManualFrequencyAddBulkForm>
        serverState={serverState}
      />

      {/* <form.Field
        name='userId'
        children={(field) => (
          <input
            type='hidden'
            value={field.state.value as any}
            name={field.name}
          />
        )}
      /> */}

      <div className='flex items-center justify-baseline gap-4'>
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

        <form.Field name='hours'>
          {(field) => (
            <FormInputField
              field={field}
              label={fieldLabels.hours}
              placeholder='Quantidade de horas'
              className='mb-4 w-15'
            />
          )}
        </form.Field>

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

        <div className='flex-1'>
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
        </div>
      </div>
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

      {/* <form.Field
        name='workerContractId'
        children={(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.workerContractId}
            placeholder='Selecione o contrato'
            className='mb-4'
          />
        )}
      /> */}

      <Button type='button' onClick={handleAddFrequency} className='mb-4'>
        Inserir frequência de colaborador
      </Button>

      <form.Field name='items' mode='array'>
        {(field) => {
          return (
            <TableFormFrequencyItems
              items={
                field.state.value as (IWorkerManualFrequencyAdd & {
                  key: number;
                })[]
              }
              onRemove={handleRemoveFrequency}
              onUpdateField={handleUpdateFrequencyField}
              relatedData={relatedData}
              fieldLabels={fieldLabels}
            />
          );
        }}
      </form.Field>

      <div className='mt-8 flex justify-end gap-3'>
        <Button type='button' variant='outline' onClick={handleReset}>
          Limpar
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
              disabled={!canSubmit || isPending || isValidating || !isTouched}
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
