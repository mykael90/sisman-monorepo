import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { CirclePlus, Save } from 'lucide-react';
import { IActionResultForm } from '@/types/types-server-actions';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import {
  IWorkerSpecialty,
  IWorkerSpecialtyAdd,
  IWorkerSpecialtyEdit
} from '../../worker-specialty-types';
import { Textarea } from '@/components/ui/textarea';

type WorkerSpecialtyFormData<TMode extends 'add' | 'edit'> = TMode extends 'add'
  ? IWorkerSpecialtyAdd
  : IWorkerSpecialtyEdit;

export default function WorkerSpecialtyForm<TMode extends 'add' | 'edit'>({
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
  defaultData: WorkerSpecialtyFormData<TMode>;
  formActionProp: (
    prevState: IActionResultForm<
      WorkerSpecialtyFormData<TMode>,
      IWorkerSpecialty
    >,
    data: WorkerSpecialtyFormData<TMode>
  ) => Promise<
    IActionResultForm<WorkerSpecialtyFormData<TMode>, IWorkerSpecialty>
  >;
  initialServerState?: IActionResultForm<
    WorkerSpecialtyFormData<TMode>,
    IWorkerSpecialty
  >;
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
    onSubmit: async ({ value }: { value: WorkerSpecialtyFormData<TMode> }) => {
      console.log('WorkerSpecialty Form submitted with values:', value);
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
      <FormSuccessDisplay<WorkerSpecialtyFormData<TMode>, IWorkerSpecialty>
        serverState={serverState}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels}
        messageActions={{
          handleResetForm: 'Cadastrar nova especialidade',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Criar Especialidade' : 'Salvar Alterações');

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
      <ErrorServerForm<WorkerSpecialtyFormData<TMode>>
        serverState={serverState}
      />

      {mode === 'edit' && (
        <form.Field
          name='id'
          children={(field) => (
            <FormInputField
              field={field as any}
              label={fieldLabels.id}
              placeholder='Ex: 100'
              className='mb-4'
              disabled
            />
          )}
        />
      )}

      <form.Field name='name'>
        {(field) => (
          <FormInputField
            field={field as any}
            label={fieldLabels.name}
            placeholder='Ex: Eletricista'
            className='mb-4'
            onValueBlurParser={(value) => value.toUpperCase()}
          />
        )}
      </form.Field>

      <form.Field name='description'>
        {(field) => (
          <div className='mb-4'>
            <label
              htmlFor={field.name}
              className='block text-sm font-medium text-gray-700'
            >
              {fieldLabels.description}
            </label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder='Descrição detalhada da especialidade'
              className='mt-1'
            />
            {field.state.meta.errors && (
              <p className='mt-1 text-sm text-red-600'>
                {field.state.meta.errors.join(', ')}
              </p>
            )}
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
