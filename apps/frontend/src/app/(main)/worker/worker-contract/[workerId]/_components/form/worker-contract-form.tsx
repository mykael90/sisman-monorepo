import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import {
  FormDropdownModal,
  FormInputField
} from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CirclePlus, Save } from 'lucide-react';
import { IActionResultForm } from '@/types/types-server-actions';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import {
  IWorkerContract,
  IWorkerContractAdd,
  IWorkerContractEdit,
  IWorkerContractRelatedData
} from '../../../worker-contract-types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '../../../../../../../components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../../../../../../../components/ui/popover';
import { format } from 'date-fns';
import { cn } from '../../../../../../../lib/utils';
import { Calendar } from '../../../../../../../components/ui/calendar';
import { ptBR } from 'date-fns/locale';

type WorkerContractFormData<TMode extends 'add' | 'edit'> = TMode extends 'add'
  ? IWorkerContractAdd
  : IWorkerContractEdit;

export default function WorkerContractForm<TMode extends 'add' | 'edit'>({
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
  isInDialog = false,
  relatedData
}: {
  mode: TMode;
  defaultData: WorkerContractFormData<TMode>;
  formActionProp: (
    prevState: IActionResultForm<
      WorkerContractFormData<TMode>,
      IWorkerContract
    >,
    data: WorkerContractFormData<TMode>
  ) => Promise<
    IActionResultForm<WorkerContractFormData<TMode>, IWorkerContract>
  >;
  initialServerState?: IActionResultForm<
    WorkerContractFormData<TMode>,
    IWorkerContract
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
  relatedData: IWorkerContractRelatedData;
}) {
  const [serverState, dispatchFormAction, isPending] = useActionState(
    formActionProp,
    initialServerState
  );

  const { listSpecialities, listContracts } = relatedData;

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    ),
    // validators: formSchema ? { onChange: formSchema } : undefined,
    onSubmit: async ({ value }: { value: WorkerContractFormData<TMode> }) => {
      console.log('WorkerContract Form submitted with values:', value);
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
      <FormSuccessDisplay<WorkerContractFormData<TMode>, IWorkerContract>
        serverState={serverState}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels}
        messageActions={{
          handleResetForm: 'Cadastrar nova contrato',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Criar Contrato' : 'Salvar Alterações');

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
      <ErrorServerForm<WorkerContractFormData<TMode>>
        serverState={serverState}
      />

      {/* {mode === 'edit' && (
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
      )} */}

      <form.Field
        name='workerSpecialtyId'
        children={(field: any) => (
          <FormDropdownModal
            field={field}
            label={fieldLabels.workerSpecialtyId}
            placeholder='Informar especialidade...'
            className='mb-4'
            options={listSpecialities.map((specialty) => ({
              value: String(specialty.id),
              label: `${specialty.name}`
            }))}
            onValueChange={(value) => field.handleChange(Number(value))}
          />
        )}
      />

      <form.Field
        name='contractId'
        children={(field: any) => (
          <FormDropdownModal
            field={field}
            label={fieldLabels.contractId}
            placeholder='Informar contrato...'
            className='mb-4 w-full'
            options={listContracts.map((contract) => ({
              value: String(contract.id),
              label: `${contract.codigoSipac} - ${contract.subject}`
            }))}
            onValueChange={(value) => field.handleChange(Number(value))}
          />
        )}
      />

      <form.Field name='sipacUnitLocationCode'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.sipacUnitLocationCode}
            type='text'
            placeholder='Digite o o codigo da unidade SIPAC'
            className='mb-4'
          />
        )}
      </form.Field>

      <div className='mb-4 flex justify-start gap-4'>
        <div>
          <form.Field
            name='startDate'
            children={(field) => (
              <>
                <Label
                  htmlFor='startDate'
                  className='block pb-1 text-sm font-medium text-gray-700'
                >
                  Início
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.state.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {field.state.value ? (
                        format(field.state.value as any, 'PPP', {
                          locale: ptBR
                        })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={
                        field.state.value
                          ? new Date(field.state.value as any)
                          : undefined
                      }
                      onSelect={(date) => date && field.setValue(date as any)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </>
            )}
          />
        </div>
        <div>
          <form.Field
            name='endDate'
            children={(field) => (
              <>
                <Label
                  htmlFor='endDate'
                  className='block pb-1 text-sm font-medium text-gray-700'
                >
                  Início
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.state.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {field.state.value ? (
                        format(field.state.value as any, 'PPP', {
                          locale: ptBR
                        })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={
                        field.state.value
                          ? new Date(field.state.value as any)
                          : undefined
                      }
                      onSelect={(date) => date && field.setValue(date as any)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </>
            )}
          />
        </div>
      </div>

      <form.Field name='notes'>
        {(field) => (
          <div className='mb-4'>
            <label
              htmlFor={field.name}
              className='block text-sm font-medium text-gray-700'
            >
              {fieldLabels.notes}
            </label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder='Notas adicionais...'
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
