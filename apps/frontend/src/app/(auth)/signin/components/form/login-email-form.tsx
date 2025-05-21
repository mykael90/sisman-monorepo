'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { useActionState } from 'react';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { ErrorServerForm } from '../../../../../components/form-tanstack/error-server-form';
import { UserPlus } from 'lucide-react';
import { z } from 'zod';
import { requestMagicLink } from '../../signin-actions';

interface IEmailAdd {
  email: string;
}

const defaultData: IEmailAdd = {
  email: ''
};

const initialServerState: IActionResultForm<IEmailAdd> = {
  isSubmitSuccessful: false,
  message: ''
};

const fieldLabels: IEmailAdd = {
  email: 'Email'
};

export default function LoginForm() {
  const [serverState, formAction, isPending] = useActionState(
    requestMagicLink,
    initialServerState
  );

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    )
  });

  useStore(form.store, (formState) => formState.errorsServer);

  const currentSubmitButtonText = 'Receber código';

  const CurrentSubmitButtonIcon = <UserPlus className='mr-2 h-5 w-5' />;

  return (
    <form
      action={formAction} // Server action do useActionState
      onSubmit={() => {
        form.handleSubmit();
      }}
      onReset={() => {
        form.reset();
      }}
      className=''
    >
      <ErrorServerForm serverState={serverState} />

      <div className='flex flex-row items-center justify-between gap-2'>
        <form.Field
          name='email'
          validators={{
            onBlur: z
              .string()
              .email('E-smail inválido')
              .min(3, 'Campo obrigatório')
          }}
        >
          {(field) => (
            <FormInputField
              field={field}
              label={fieldLabels.email}
              type='email'
              placeholder='Digite o email'
              showLabel={false}
            />
          )}
        </form.Field>
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
