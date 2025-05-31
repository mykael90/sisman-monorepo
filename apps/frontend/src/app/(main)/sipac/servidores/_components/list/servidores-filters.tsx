'use client';

import { Button } from '@/components/ui/button';
import { memo } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  FormInputField,
  FormInputFieldSearch
} from '@/components/form-tanstack/form-input-fields';
import { IServidor } from '../../servidores-types';
import { searchServidores } from '../../servidores-actions';
import { useTransition, ReactNode } from 'react';
import { Search } from 'lucide-react';

const fieldLabels: Partial<IServidor> = {
  nome: 'Nome'
};

// Usando desestruturação nas props para clareza
const ServidoresFilters = memo(function ServidoresFilters({
  setServidores,
  onClearFilters // Recebe a função de limpar
}) {
  const [isPending, startTransition] = useTransition();
  const defaultData: Partial<IServidor> = {
    nome: ''
  };
  // O handleClearFilters agora simplesmente chama a função do pai
  const handleClearFilters = () => {
    onClearFilters();
  };

  const handleSearch = (value: Partial<IServidor>) => {
    if (searchServidores) {
      startTransition(() => {
        // Chamar searchServidores() aqui (que é getUsers, uma Server Action).
        // Isso deve, idealmente, fazer com que o Server Component `Page`
        // seja revalidado e re-renderizado. Ao re-renderizar, `Page`
        // gerará uma nova `currentDataPromise` e uma nova `keyForDisplayData`.
        // A nova `key` fará com que esta instância de `DisplayData` seja
        // desmontada e uma nova seja montada, resetando todo o seu estado.
        searchServidores(`nome=${value.nome}`)
          .then((result) => {
            const servidores = result;
            setServidores(servidores);
            // logger.info('searchServidores completed on client, Page should revalidate and re-render.');
            // Não é necessário fazer setCurrentData aqui, pois o componente será remontado
          })
          .catch((error) => {
            // logger.error('Error during searchServidores:', error);
            // Lidar com erro, se necessário
            throw error;
          });
      });
    } else {
      console.warn(
        'DisplayData: A propriedade searchServidores não foi fornecida.'
      );
    }
  };

  const form = useForm({
    defaultValues: defaultData,
    // Add onSubmit to get validated values
    onSubmit: async ({ value }) => {
      // `value` is the validated form data as an object
      // `dispatchFormAction` is the function returned by `useActionState`
      // It expects the new "payload" as its argument.
      // The `prevState` is managed internally by `useActionState`.
      console.log('Form submitted with values:', value);
      handleSearch(value);
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation(); // Good practice with manual handleSubmit
        form.handleSubmit(); // This will call the `onSubmit` defined in `useForm` options
      }}
      onReset={(e) => {
        e.preventDefault();
        form.reset();
      }}
      className=''
    >
      <div className='flex flex-row items-start justify-between gap-4'>
        <form.Field name='nome'>
          {(field) => (
            <div className='relative flex-1'>
              <FormInputFieldSearch
                field={field}
                label={fieldLabels.nome as string}
                placeholder='Digite o nome do servidor para consulta...'
                showLabel={false}
                className=''
              />
            </div>
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
              variant='outline'
              className='flex items-center'
              type='submit'
              disabled={!canSubmit || isValidating || !isTouched}
            >
              {' '}
              {isValidating ? (
                'Procurando...'
              ) : (
                <>
                  <Search className='mr-2 h-4 w-4' /> Procurar
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
});

export { ServidoresFilters };
