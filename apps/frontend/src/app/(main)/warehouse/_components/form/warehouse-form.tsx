'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { CirclePlus, Save } from 'lucide-react';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import {
  IWarehouse,
  IWarehouseAdd,
  IWarehouseEdit
} from '../../warehouse-types';

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
  fieldLabels = {
    name: 'Nome',
    code: 'Código',
    location: 'Localização',
    maintenanceInstanceId: 'ID Instância Manutenção',
    isActive: 'Ativo'
  },
  onCancel,
  onClean,
  submitButtonText,
  SubmitButtonIcon,
  isInDialog = false
}: {
  mode: TMode;
  defaultData: WarehouseFormData<TMode>;
  formActionProp: (
    prevState: IActionResultForm<WarehouseFormData<TMode>, IWarehouse>,
    data: WarehouseFormData<TMode>
  ) => Promise<IActionResultForm<WarehouseFormData<TMode>, IWarehouse>>;
  initialServerState?: IActionResultForm<WarehouseFormData<TMode>, IWarehouse>;
  fieldLabels?: Record<string, string>;
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
    onSubmit: async ({ value }: { value: WarehouseFormData<TMode> }) => {
      await dispatchFormAction(value);
    }
  });

  const handleReset = onClean
    ? () => {
        form.reset();
        onClean();
      }
    : undefined;

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Criar Depósito' : 'Salvar Alterações');

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
      className='space-y-4'
    >
      <form.Field name='name'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.name}
            placeholder='Nome do depósito'
          />
        )}
      </form.Field>

      <form.Field name='code'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.code}
            placeholder='Código do depósito'
          />
        )}
      </form.Field>

      <form.Field name='location'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.location}
            placeholder='Localização do depósito'
          />
        )}
      </form.Field>

      <form.Field name='maintenanceInstanceId'>
        {(field) => (
          <FormInputField
            field={field}
            type='number'
            label={fieldLabels.maintenanceInstanceId}
            placeholder='ID da instância de manutenção'
          />
        )}
      </form.Field>

      <form.Field name='isActive'>
        {(field) => {
          const value = field.state.value as boolean;
          return (
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <label className='text-base'>{fieldLabels.isActive}</label>
              <input
                type='checkbox'
                checked={value}
                onChange={(e) => field.handleChange(e.target.checked as any)}
                className='h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
              />
            </div>
          );
        }}
      </form.Field>

      <div className='flex justify-end gap-3'>
        {mode === 'add' && handleReset && (
          <Button type='button' variant='outline' onClick={handleReset}>
            Limpar
          </Button>
        )}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type='submit'
              disabled={!canSubmit || isPending || isSubmitting}
            >
              {isPending || isSubmitting
                ? 'Processando...'
                : CurrentSubmitButtonIcon}
              {isPending || isSubmitting ? '' : currentSubmitButtonText}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
