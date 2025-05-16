'use client';

import { AlertCircle } from 'lucide-react';
import type { IActionResultForm } from '../../types/types-server-actions';

export function ErrorServerForm<TData = any>({
  serverState
}: {
  serverState: IActionResultForm<TData>;
}) {
  // Condition to render: message exists, and the form submission was not successful.
  // serverState.isSubmitSuccessful being true means success.
  // serverState.isSubmitSuccessful being false means explicit error.
  // serverState.isSubmitSuccessful being undefined (with a message) means non-success info/error.
  if (!serverState.message || serverState.isSubmitSuccessful === true) {
    return null;
  }

  // Determine styling and title based on whether isSubmitSuccessful is explicitly false.
  // The original logic uses green styling for "Info:" when isSubmitSuccessful is undefined
  // but a message exists and it's not a successful submission. This behavior is preserved.
  const isExplicitError = serverState.isSubmitSuccessful === false;
  const containerClasses = `mb-4 rounded border p-3 ${
    isExplicitError
      ? 'border-red-400 bg-red-100 text-red-700'
      : 'border-green-400 bg-green-100 text-green-700' // Green for "Info" on non-success
  }`;
  const title = isExplicitError ? 'Erro:' : 'Info:';

  const errorsServer = serverState.errorsServer || [];
  const errorsFieldsServer = serverState.errorsFieldsServer || {};

  return (
    <div className={containerClasses}>
      <div className='flex items-center'>
        <AlertCircle className='mr-2 h-5 w-5' />
        <strong>{title}</strong>
      </div>
      <p className='mt-1 ml-7'>{serverState.message}</p>

      {errorsServer.length > 0 && (
        <ul className='mt-1 ml-5 list-inside list-disc'>
          {errorsServer.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}

      {Object.entries(errorsFieldsServer).length > 0 && (
        <ul className='mt-1 ml-5 list-inside list-disc'>
          {Object.entries(errorsFieldsServer).map(([field, fieldErrors]) => (
            <li key={field}>
              <strong>{field}:</strong>
              <ul className='mt-1 ml-7 list-inside list-disc'>
                {Array.isArray(fieldErrors) &&
                  fieldErrors?.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
