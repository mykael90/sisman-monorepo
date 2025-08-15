'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { IActionResultForm } from '@/types/types-server-actions';
import { formatRequestNumber } from '@/lib/form-utils';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef, useTransition } from 'react';
import { schemaZodRequisicoesSipac } from '@/lib/schema-zod-requisicoes-sipac';
import { ISipacRequisicaoManutencaoWithRelations } from '../../requisicoes-manutencoes-types';
import {
  handleFetchRequisicaoManutencao,
  persistSipacRequisicoesManutencao
} from '../../requisicoes-manutencoes-actions';

interface IRequestDataSearch {
  numeroAno: string;
}

const initialServerStateSearchData: IActionResultForm<
  IRequestDataSearch,
  ISipacRequisicaoManutencaoWithRelations
> = {
  isSubmitSuccessful: false,
  message: '',
  submissionAttempts: 0
};

const fieldLabelsRequestData: IRequestDataSearch = {
  numeroAno: 'Número da requisição'
};

const defaultDataRequest: IRequestDataSearch = {
  numeroAno: ''
};

export function ImportarRequisicaoSipacForm({
  setManutencaoDadosSipac
}: {
  setManutencaoDadosSipac: React.Dispatch<
    React.SetStateAction<ISipacRequisicaoManutencaoWithRelations | null>
  >;
}) {
  // Estado referente ao formulário de consulta da requisição
  const [isPendingTransition, startTransition] = useTransition();

  const [serverStateDataSearch, formActionDataSearch, isPendingDataSearch] =
    useActionState(
      handleFetchRequisicaoManutencao,
      initialServerStateSearchData
    );

  const lastMessageRef = useRef('');

  useEffect(() => {
    if (!isPendingDataSearch && serverStateDataSearch?.message) {
      if (serverStateDataSearch.message !== lastMessageRef.current) {
        if (serverStateDataSearch.isSubmitSuccessful) {
          toast.success(serverStateDataSearch.message);
          setManutencaoDadosSipac(serverStateDataSearch.responseData || null);
        } else {
          toast.error(serverStateDataSearch.message);
          setManutencaoDadosSipac(null);
        }
        lastMessageRef.current = serverStateDataSearch.message;
      }
    }
  }, [isPendingDataSearch, serverStateDataSearch, setManutencaoDadosSipac]);

  //Formulario de consulta de informações da requisição de manutenção ou material
  const formRequest = useForm({
    defaultValues: defaultDataRequest,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverStateDataSearch ?? {}),
      [serverStateDataSearch]
    ),
    onSubmit: async ({ value }) => {
      const formattedRequestNumber = formatRequestNumber(value.numeroAno);
      if (formattedRequestNumber) {
        await formActionDataSearch(formattedRequestNumber);
      }
    }
  });

  return (
    <form
      id='form-request'
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formRequest.handleSubmit();
      }}
    >
      <div className='space-y-6'>
        {/* Request number */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              Importar requisição de manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-end gap-4'>
              {/* <SearchInput
                  placeholder='Search for WO by number or person responsible'
                  onSearch={(value) => console.log('WO Search:', value)}
                /> */}
              <formRequest.Field
                name='numeroAno'
                validators={{
                  onBlur: schemaZodRequisicoesSipac.shape.newReq
                }}
              >
                {(field) => (
                  <FormInputField
                    field={field}
                    label={fieldLabelsRequestData.numeroAno}
                    type='tel'
                    placeholder='Digite o número...'
                    showLabel={true}
                    className='w-38'
                    onValueBlurParser={(value) => formatRequestNumber(value)}
                  />
                )}
              </formRequest.Field>
              <formRequest.Subscribe
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
                    {isSubmitting ? (
                      'Vefificando...'
                    ) : (
                      <Search className='h-4 w-4' />
                    )}
                  </Button>
                )}
              </formRequest.Subscribe>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
