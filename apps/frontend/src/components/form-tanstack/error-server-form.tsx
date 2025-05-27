'use client';

import type { IActionResultForm } from '../../types/types-server-actions';
import { AlertCircle } from 'lucide-react';

// TApiResponse can be 'unknown' if responseData is not used by this component
interface ErrorServerFormProps<TSubmittedData> {
  serverState?: IActionResultForm<TSubmittedData, unknown>; // Use unknown for TApiResponse
}

export const ErrorServerForm = <TSubmittedData,>({
  serverState
}: ErrorServerFormProps<TSubmittedData>) => {
  if (
    !serverState ||
    serverState.isSubmitSuccessful === true ||
    (!serverState.errorsServer?.length &&
      !Object.keys(serverState.errorsFieldsServer || {}).length && // Check if errorsFieldsServer has keys
      !serverState.message)
  ) {
    return null;
  }

  return (
    <div
      className='mb-4 rounded-md border border-red-400 bg-red-50 p-4 text-sm text-red-700'
      role='alert'
    >
      {' '}
      <AlertCircle className='mr-2 mb-2 h-5 w-5' />
      {serverState.message && (
        <p className='font-semibold'>{serverState.message}</p>
      )}
      {serverState.errorsServer && serverState.errorsServer.length > 0 && (
        <ul className='mt-1 list-inside list-disc'>
          {serverState.errorsServer.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
      {serverState.errorsFieldsServer &&
        Object.keys(serverState.errorsFieldsServer).length > 0 && (
          <div className='mt-1'>
            <p className='font-medium'>Erros nos campos:</p>
            <ul className='list-inside list-disc'>
              {Object.entries(serverState.errorsFieldsServer).map(
                ([field, fieldErrors]) => (
                  <li key={field}>
                    <strong>{field}:</strong>
                    <ul className='mt-1 ml-7 list-inside list-disc'>
                      {Array.isArray(fieldErrors) &&
                        fieldErrors?.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
    </div>
  );
};
