'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { Paperclip, Save, Plus } from 'lucide-react';
import { IActionResultForm } from '@/types/types-server-actions';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import { IAttachment, IAttachmentAdd } from '../../attachment-types';

export default function AttachmentForm({
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
  mode: 'add' | 'edit';
  defaultData: IAttachmentAdd;
  formActionProp: (
    prevState: IActionResultForm<IAttachmentAdd, IAttachment>,
    data: FormData
  ) => Promise<IActionResultForm<IAttachmentAdd, IAttachment>>;
  initialServerState?: IActionResultForm<IAttachmentAdd, IAttachment>;
  fieldLabels: {
    [k: string]: string;
  };
  formSchema?: any;
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
    onSubmit: async ({ value }: { value: IAttachmentAdd }) => {
      const formData = new FormData();
      formData.append('relatedId', String(value.relatedId));
      formData.append('relatedModel', value.relatedModel);
      if (value.file) {
        formData.append('file', value.file);
      }
      await dispatchFormAction(formData);
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
      <FormSuccessDisplay<IAttachmentAdd, IAttachment>
        serverState={serverState}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels}
        messageActions={{
          handleResetForm: 'Adicionar novo anexo',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Adicionar Anexo' : 'Salvar Alterações');

  const CurrentSubmitButtonIcon =
    (SubmitButtonIcon && <SubmitButtonIcon className='mr-2 h-5 w-5' />) ||
    (mode === 'add' ? (
      <Plus className='mr-2 h-5 w-5' />
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
      <ErrorServerForm<IAttachmentAdd> serverState={serverState} />

      <form.Field name='relatedModel'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.relatedModel}
            placeholder='Ex: User, Contract, etc'
            className='mb-4'
          />
        )}
      </form.Field>

      <form.Field name='relatedId'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.relatedId}
            placeholder='ID do registro relacionado'
            className='mb-4'
          />
        )}
      </form.Field>

      <form.Field name='file'>
        {(field) => (
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              {fieldLabels.file}
            </label>
            <div className='flex items-center gap-2'>
              <input
                type='file'
                id={field.name}
                name={field.name}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    field.handleChange(file);
                  }
                }}
                className='hidden'
              />
              <Button
                type='button'
                variant='outline'
                onClick={() => document.getElementById(field.name)?.click()}
                className='w-full justify-start'
              >
                <Paperclip className='mr-2 h-4 w-4' />
                {field.state.value
                  ? (field.state.value as File).name
                  : 'Selecionar arquivo'}
              </Button>
            </div>
            {field.state.meta.errors ? (
              <em className='mt-1 block text-xs text-red-600'>
                {field.state.meta.errors.join(', ')}
              </em>
            ) : null}
          </div>
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
