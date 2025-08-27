'use client';

import { Button } from '@/components/ui/button';
import { useForm } from '@tanstack/react-form';
import { FormInputFieldSearch } from '@/components/form-tanstack/form-input-fields';
import { searchTerceiro } from '../../terceiro-actions';
import { Search } from 'lucide-react';
import { ITerceiro } from '../../terceiro-types';

const fieldLabels: Partial<Record<keyof ITerceiro, string>> = {
  'nome-contratado': 'Nome Contratado',
  'cpf-contratado': 'CPF Contratado',
  'nome-fornecedor': 'Nome Fornecedor',
  'cnpj-fornecedor': 'CNPJ Fornecedor',
  'numero-contrato': 'Número Contrato'
};

export function TerceiroSearch({
  setTerceiro
}: {
  setTerceiro: React.Dispatch<React.SetStateAction<ITerceiro[]>>;
}) {
  const defaultData: Partial<ITerceiro> = {
    'nome-contratado': '',
    'cpf-contratado': undefined,
    'nome-fornecedor': '',
    'cnpj-fornecedor': undefined,
    'numero-contrato': undefined
  };

  const handleSearchTerceiro = async (values: Partial<ITerceiro>) => {
    try {
      const queryParams = Object.entries(values)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([key, value]) => {
          if (typeof value === 'number') {
            return `${key}=${value}`;
          }
          return `${key}=${String(value)}`;
        })
        .join('&');

      const result = await searchTerceiro(queryParams);
      setTerceiro(result);
    } catch (error) {
      console.error('Erro durante a busca:', error);
      throw error;
    }
  };

  const form = useForm({
    defaultValues: defaultData,
    onSubmit: async ({ value }) => {
      console.log('Iniciando envio. isSubmitting:', form.state.isSubmitting);
      console.log('Form submitted with values:', value);

      await handleSearchTerceiro(value);

      console.log('Envio concluído. isSubmitting:', form.state.isSubmitting);
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
      className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
    >
      <form.Field name='nome-contratado'>
        {(field) => (
          <div className='relative flex-1'>
            <FormInputFieldSearch
              field={field}
              label={fieldLabels['nome-contratado'] as string}
              placeholder='Digite o nome do contratado...'
              showLabel={true}
              className=''
            />
          </div>
        )}
      </form.Field>
      {/* <form.Field name='cpf-contratado'>
        {(field) => (
          <div className='relative flex-1'>
            <FormInputFieldSearch
              field={field}
              label={fieldLabels['cpf-contratado'] as string}
              placeholder='Digite o CPF do contratado (somente números)...'
              showLabel={true}
              className=''
              type='number'
            />
          </div>
        )}
      </form.Field> */}
      <form.Field name='nome-fornecedor'>
        {(field) => (
          <div className='relative flex-1'>
            <FormInputFieldSearch
              field={field}
              label={fieldLabels['nome-fornecedor'] as string}
              placeholder='Digite o nome do fornecedor...'
              showLabel={true}
              className=''
            />
          </div>
        )}
      </form.Field>
      <form.Field name='cnpj-fornecedor'>
        {(field) => (
          <div className='relative flex-1'>
            <FormInputFieldSearch
              field={field}
              label={fieldLabels['cnpj-fornecedor'] as string}
              placeholder='Digite o CNPJ do fornecedor (somente números)...'
              showLabel={true}
              className=''
              type='number'
            />
          </div>
        )}
      </form.Field>
      <form.Field name='numero-contrato'>
        {(field) => (
          <div className='relative flex-1'>
            <FormInputFieldSearch
              field={field}
              label={fieldLabels['numero-contrato'] as string}
              placeholder='Digite o número do contrato (somente números)...'
              showLabel={true}
              className=''
              type='number'
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => [
          state.canSubmit,
          state.isTouched,
          state.isValidating,
          state.isSubmitting
        ]}
      >
        {([canSubmit, isTouched, isValidating, isSubmitting]) => (
          <Button
            variant='outline'
            className='flex items-center'
            type='submit'
            disabled={!canSubmit || isValidating || !isTouched}
          >
            {' '}
            {isValidating || isSubmitting ? (
              'Procurando...'
            ) : (
              <>
                <Search className='mr-2 h-4 w-4' /> Procurar
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
      <div>
        <form.Subscribe selector={(state) => [state.isSubmitting]}>
          {([isSubmitting]) => (
            <div className='py-1 text-sm text-gray-500'>
              {isSubmitting && <> Realizando nova busca... </>}
            </div>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
