'use client';

import { Button } from '@/components/ui/button';
import { memo, Dispatch, SetStateAction, useTransition } from 'react';
import { useForm } from '@tanstack/react-form';
import { FormInputFieldSearch } from '@/components/form-tanstack/form-input-fields';
import { IServidor, IServidoresList } from '../../servidores-types';
import { searchServidores } from '../../servidores-actions';
import { Search } from 'lucide-react';

interface ServidoresFiltersProps {
  setServidores: Dispatch<SetStateAction<IServidoresList[]>>;
}

const fieldLabels: Partial<IServidor> = {
  nome: 'Nome'
};

const ServidoresFilters = memo(function ServidoresFilters({
  setServidores
}: ServidoresFiltersProps) {
  const [isPending, startTransition] = useTransition();
  const defaultData: Partial<IServidor> = {
    nome: ''
  };

  const handleSearch = (value: Partial<IServidor>) => {
    if (searchServidores) {
      startTransition(() => {
        searchServidores(`nome=${value.nome}`)
          .then((result) => {
            const servidores = result;
            setServidores(servidores);
          })
          .catch((error) => {
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
    onSubmit: async ({ value }) => {
      console.log('Form submitted with values:', value);
      handleSearch(value);
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
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
