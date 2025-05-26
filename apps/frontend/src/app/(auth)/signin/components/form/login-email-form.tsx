'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { useActionState, useMemo } from 'react';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { ErrorServerForm } from '../../../../../components/form-tanstack/error-server-form';
import { z } from 'zod';
import { requestMagicLink } from '../../signin-actions';
import { signIn } from 'next-auth/react';

interface IEmailAdd {
  email: string;
  callbackUrl: string;
}
interface ICodeAdd {
  code: string;
}

const defaultDataCode: ICodeAdd = {
  code: ''
};

const initialServerStateEmail: IActionResultForm<IEmailAdd> = {
  isSubmitSuccessful: false,
  message: ''
};

const fieldLabels: IEmailAdd = {
  email: 'Email',
  callbackUrl: 'Callback URL'
};

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [serverState, formAction, isPending] = useActionState(
    requestMagicLink,
    initialServerStateEmail
  );

  const defaultDataEmail: IEmailAdd = useMemo(() => {
    return {
      email: '',
      callbackUrl: callbackUrl
    };
  }, [callbackUrl]);

  const formEmail = useForm({
    defaultValues: defaultDataEmail,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    )
  });
  const formCode = useForm({
    defaultValues: defaultDataCode,
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log({ ...value, email: email });
      signIn('magic-link-verifier', {
        callbackUrl,
        email: email,
        code: value.code
      });
    }
  });
  const email = useStore(formEmail.store, (state) => state.values.email);

  // useStore(formEmail.store, (formState) => formState.errorsServer);

  return (
    <>
      {serverState.isSubmitSuccessful === true && (
        <>
          <div className='mt-2 rounded-lg p-2 text-center shadow-md'>
            <h2 className={`text-sisman-green text-md font-semibold`}>
              Email enviado com sucesso!
            </h2>
          </div>
          <form
            id='form-code'
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              formCode.handleSubmit();
            }}
            className=''
          >
            <ErrorServerForm serverState={serverState} />
            <div className='my-4 flex flex-row items-start justify-end gap-2'>
              <formCode.Field
                name='code'
                validators={{
                  onBlur: z
                    .string()
                    .min(6, 'Código inválido')
                    .max(6, 'Código inválido')
                }}
              >
                {(field) => (
                  <FormInputField
                    field={field}
                    label={fieldLabels.email}
                    type='tel'
                    placeholder='Digite o código'
                    showLabel={false}
                    className='w-38'
                  />
                )}
              </formCode.Field>
              <formCode.Subscribe
                selector={(state) => [
                  state.canSubmit,
                  state.isTouched,
                  state.isSubmitting
                ]}
              >
                {([canSubmit, isTouched, isSubmitting]) => (
                  <Button
                    type='submit'
                    disabled={!canSubmit || isSubmitting || !isTouched}
                  >
                    {isSubmitting ? 'Vefificando...' : 'Acessar'}
                  </Button>
                )}
              </formCode.Subscribe>
            </div>
          </form>
        </>
      )}
      {serverState.isSubmitSuccessful === false && (
        <form
          id='form-email'
          action={formAction} // Server action do useActionState
          onSubmit={() => {
            formEmail.handleSubmit();
          }}
          className=''
        >
          <ErrorServerForm serverState={serverState} />
          <div className='my-4 flex flex-row items-start justify-between gap-2'>
            <formEmail.Field
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
                  className='flex-1'
                />
              )}
            </formEmail.Field>

            <formEmail.Field
              name={'callbackUrl'}
              children={(field) => (
                <input
                  type='hidden'
                  value={field.state.value}
                  name={field.name}
                />
              )}
            />

            <formEmail.Subscribe
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
                    !canSubmit || isPending || isValidating || !isTouched
                  }
                >
                  {isPending || isValidating
                    ? 'Enviando...'
                    : 'Solicitar código'}
                </Button>
              )}
            </formEmail.Subscribe>
          </div>
        </form>
      )}
    </>
  );
}
