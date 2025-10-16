import {
  mergeForm,
  useForm,
  useStore,
  useTransform
} from '@tanstack/react-form';
import {
  IStockMovementCountAdd,
  IStockMovementWithRelations
} from '../../../stock-movement/stock-movement-types';
import { IActionResultForm } from '../../../../../../../types/types-server-actions';
import { IWarehouseStockWithRelations } from '../../../warehouse-stock/warehouse-stock-types';
import { FC, useActionState } from 'react';
import { FormSuccessDisplay } from '../../../../../../../components/form-tanstack/form-success-display';
import { Button } from '../../../../../../../components/ui/button';
import { ErrorServerForm } from '../../../../../../../components/form-tanstack/error-server-form';
import { FormInputField } from '../../../../../../../components/form-tanstack/form-input-fields';

export default function MaterialCountForm({
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
  defaultData: IStockMovementCountAdd;
  formActionProp: (
    prevState: IActionResultForm<
      IStockMovementCountAdd,
      IStockMovementWithRelations
    >, // Adjusted prevState type
    data: IStockMovementCountAdd // Data is now an object
  ) => Promise<
    IActionResultForm<IStockMovementCountAdd, IStockMovementWithRelations>
  >;
  initialServerState?: IActionResultForm<
    IStockMovementCountAdd,
    IStockMovementWithRelations
  >;
  fieldLabels: {
    [k: string]: string;
  };
  formSchema?: any;
  onCancel?: () => void;
  onClean?: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: { materialStock: IWarehouseStockWithRelations };
  isInDialog?: boolean;
}) {
  const [serverState, dispatchFormAction, isPending] = useActionState(
    formActionProp,
    initialServerState
  );

  const { materialStock } = relatedData;

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    ),
    validators: formSchema ? { onChange: formSchema } : undefined,
    // Add onSubmit to get validated values
    onSubmit: async ({ value }: { value: IStockMovementCountAdd }) => {
      // `value` is the validated form data as an object
      // `dispatchFormAction` is the function returned by `useActionState`
      // It expects the new "payload" as its argument.
      // The `prevState` is managed internally by `useActionState`.
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
    // serverState.responseData ensures we have something for IUser
    return (
      <FormSuccessDisplay<IStockMovementCountAdd, IStockMovementWithRelations> // Specify both generics
        serverState={serverState}
        handleActions={{
          // handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels} // This will be used to pick fields from Partial<IUser>
        messageActions={{
          // handleResetForm: 'Cadastrar nova contagem',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText = submitButtonText || 'Inserir Contagem';

  const CurrentSubmitButtonIcon = SubmitButtonIcon && (
    <SubmitButtonIcon className='mr-2 h-5 w-5' />
  );

  return (
    <form
      // Removed action={dispatchFormAction}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation(); // Good practice with manual handleSubmit
        form.handleSubmit(); // This will call the `onSubmit` defined in `useForm` options
      }}
      onReset={(e) => {
        e.preventDefault();
        handleReset && handleReset();
      }}
      className='rounded-lg bg-white p-6 shadow-md'
    >
      <ErrorServerForm<IStockMovementCountAdd> serverState={serverState} />

      <div className='ml-auto w-43'>
        <form.Field name='quantity'>
          {(field) => (
            <FormInputField
              field={field} // Cast if TS complains
              label={fieldLabels.quantity}
              type='number'
              placeholder='Quantidade contada'
              className='mb-4'
            />
          )}
        </form.Field>
      </div>

      <div className='mt-8 flex justify-end gap-3'>
        {/* <Button type='button' variant='outline' onClick={handleReset}>
          Limpar
        </Button> */}

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
                isPending || // from useActionState
                isValidating ||
                !isTouched
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
