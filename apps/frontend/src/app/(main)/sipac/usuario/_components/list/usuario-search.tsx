'use client';

import { Button } from '@/components/ui/button';
import { useForm } from '@tanstack/react-form';
import { FormInputFieldSearch } from '@/components/form-tanstack/form-input-fields';
import { searchUsuario } from '../../usuario-actions';
import { Search } from 'lucide-react';
import { IUsuario } from '../../usuario-types';

const fieldLabels: Partial<IUsuario> = {
  'nome-pessoa': 'Nome'
};

// Usando desestruturação nas props para clareza
export function UsuarioSearch({
  setUsuario
}: {
  setUsuario: React.Dispatch<React.SetStateAction<IUsuario[]>>;
}) {
  const defaultData: Partial<IUsuario> = {
    'nome-pessoa': ''
  };

  const handleSearchUsuario = async (nome: string) => {
    try {
      const result = await searchUsuario(`nome=${nome}`);
      setUsuario(result);
    } catch (error) {
      console.error('Erro durante a busca:', error);
      throw error;
    }
  };

  const form = useForm({
    defaultValues: defaultData,
    // Add onSubmit to get validated values
    onSubmit: async ({ value }) => {
      // 'isSubmitting' será true aqui, automaticamente definido pelo form.handleSubmit()
      console.log('Iniciando envio. isSubmitting:', form.state.isSubmitting);
      console.log('Form submitted with values:', value);

      await handleSearchUsuario(value['nome-pessoa'] as string);

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
      className=''
    >
      <div className='flex flex-row items-start justify-between gap-4'>
        <form.Field name='nome-pessoa'>
          {(field) => (
            <div className='relative flex-1'>
              <FormInputFieldSearch
                field={field}
                label={fieldLabels['nome-pessoa'] as string}
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
      </div>
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
