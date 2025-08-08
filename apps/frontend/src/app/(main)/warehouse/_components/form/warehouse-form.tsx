'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import {
  FormInputField,
  FormDropdown
} from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import type { IActionResultForm } from '../../../../../types/types-server-actions';
import {
  IWarehouse,
  IWarehouseAdd,
  IWarehouseEdit
} from '../../warehouse-types';
import { getFilteredPayloadForUpdate } from '@/lib/form-utils';
import { FilePlus, Save } from 'lucide-react';
import { IMaintenanceInstance } from '../../../maintenance/instance/maintenance-instance-types';

type WarehouseFormData<TMode extends 'add' | 'edit'> = TMode extends 'add'
  ? IWarehouseAdd
  : IWarehouseEdit;

export default function WarehouseForm<TMode extends 'add' | 'edit'>({
  mode,
  defaultData,
  formActionProp,
  initialServerState = {
    isSubmitSuccessful: false,
    message: ''
  },
  fieldLabels,
  formSchema, // Added formSchema prop
  onCancel,
  onClean,
  isInDialog = false,
  submitButtonText,
  SubmitButtonIcon,
  relatedData
}: {
  mode: TMode;
  defaultData: WarehouseFormData<TMode>;
  formActionProp: (
    prevState: IActionResultForm<WarehouseFormData<TMode>, IWarehouse>,
    data: WarehouseFormData<TMode>
  ) => Promise<IActionResultForm<WarehouseFormData<TMode>, IWarehouse>>;
  initialServerState?: IActionResultForm<WarehouseFormData<TMode>, IWarehouse>;
  fieldLabels: {
    [k: string]: string;
  };
  formSchema?: any; // Zod schema type
  onCancel?: () => void;
  onClean?: () => void;
  isInDialog?: boolean;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: { listMaitenanceInstances: IMaintenanceInstance[] };
}) {
  const [serverState, dispatchFormAction, isPending] = useActionState(
    formActionProp,
    initialServerState
  );

  const listMaintenanceInstances = relatedData.listMaitenanceInstances;

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    ),
    validators: formSchema ? { onChange: formSchema } : undefined, // Integrated formSchema
    onSubmit: async ({ value }) => {
      console.log('Warehouse Form submitted with values:', value);

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

  useStore(
    form.store,
    (formState: typeof form.store.state) => formState.errorsServer
  );

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
          handleResetForm: 'Cadastrar novo depósito',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Criar Depósito' : 'Salvar Alterações');

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
        form.handleSubmit(); // Call the form's handleSubmit method
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
        children={(field: any) => (
          <FormInputField
            field={field}
            label={fieldLabels.name}
            placeholder='Nome do depósito'
            className='mb-4'
          />
        )}
      />

      <form.Field
        name='code'
        children={(field: any) => (
          <FormInputField
            field={field}
            label={fieldLabels.code}
            placeholder='Código do depósito'
            className='mb-4'
          />
        )}
      />

      <form.Field
        name='location'
        children={(field: any) => (
          <FormInputField
            field={field}
            label={fieldLabels.location}
            placeholder='Localização do depósito'
            className='mb-4'
          />
        )}
      />

      <form.Field
        name='maintenanceInstanceId'
        children={(field: any) => (
          <FormDropdown
            field={field}
            label={fieldLabels.maintenanceInstanceId}
            placeholder={fieldLabels.maintenanceInstanceId}
            className='mb-4'
            options={listMaintenanceInstances.map((instance) => ({
              value: String(instance.id),
              label: `${instance.name} (${instance.sipacId})`
            }))}
            onValueChange={(value) => field.handleChange(Number(value))}
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
