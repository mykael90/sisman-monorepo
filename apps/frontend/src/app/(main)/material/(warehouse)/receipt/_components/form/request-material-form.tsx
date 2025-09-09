'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { useForm } from '@tanstack/react-form';
import { formatRequestNumber } from '@/lib/form-utils';
import { Plus, RefreshCcw, Search } from 'lucide-react';
import { toast } from 'sonner';

// Importa as funções originais das Server Actions
import { showMaterialRequestByProtocol } from '../../../../request/material-request-actions';
import { IMaterialRequestWithRelations } from '../../../../request/material-request-types';
import { schemaZodRequisicoesSipac } from '@/lib/schema-zod-requisicoes-sipac';
import { handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada } from '../../../../../sipac/requisicoes-materiais/requisicoes-materiais-actions';

export function RequestMaterialForm({
  setMaterialRequestsData,
  materialRequestsData
}: {
  setMaterialRequestsData: React.Dispatch<
    React.SetStateAction<IMaterialRequestWithRelations[] | null>
  >;
  materialRequestsData?: IMaterialRequestWithRelations[] | null;
}) {
  const [isPendingTransition, startTransition] = useTransition();

  const scrapeOrUpdateRequisicaoMaterialSipac = async (
    formattedProtocolNumber: string
  ) => {
    const scrapingRequisicaoMaterialSipac =
      await handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada(
        formattedProtocolNumber
      );
    if (scrapingRequisicaoMaterialSipac) {
      // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:

      // setMaterialRequestData(scrapingRequisicaoMaterialSipac);
      console.log(
        'Requisição de material importada do SIPAC:',
        scrapingRequisicaoMaterialSipac
      );
      startTransition(() => {
        //Uso de recursividade, como foi bem sucedido, vai localizar corretamente e vai exibir em tela na próxima chamada
        toast.success(
          `Requisição de material nº ${formattedProtocolNumber} importada do SIPAC com sucesso!`
        );
        findOrImportMaterialRequest(formattedProtocolNumber);
      });
    } else {
      toast.error(
        `Falha ao importar requisição de material nº ${formattedProtocolNumber} do SIPAC. Verifique os dados e tente novamente.`
      );
    }
  };

  const findOrImportMaterialRequest = async (
    formattedProtocolNumber: string
  ) => {
    const materialRequestResponse = await showMaterialRequestByProtocol(
      formattedProtocolNumber
    );
    if (materialRequestResponse) {
      // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:
      startTransition(() => {
        setMaterialRequestsData(materialRequestResponse);
        toast.success('Requisição de material encontrada.');
      });
    } else {
      toast.warning(
        `Requisição de número ${formattedProtocolNumber} não encontrada no SISMAN. Será realizada uma tentativa de consulta no SIPAC.`
      );
      await scrapeOrUpdateRequisicaoMaterialSipac(formattedProtocolNumber);
    }
  };

  const handleSubmit = (protocolNumber: string) => {
    const formattedProtocolNumber = formatRequestNumber(protocolNumber);
    // ---- Fluxo de Requisição de Material ----
    startTransition(async () => {
      setMaterialRequestsData(null);
      try {
        scrapeOrUpdateRequisicaoMaterialSipac(formattedProtocolNumber);
      } catch (error) {
        toast.error('Falha ao buscar requisição de material.');
      }
    });
  };

  const formRequest = useForm({
    defaultValues: { protocolNumber: '', protocols: [] },
    onSubmit: async ({ value }) => {
      handleSubmit(value.protocolNumber);
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
        {JSON.stringify(materialRequestsData)}
        {/* Request number */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              Consulta à Requisição de Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='items-top flex justify-between'>
              <formRequest.Field name='protocols' mode='array'>
                {(fieldArray) => (
                  <div>
                    <div className='flex items-baseline gap-4'>
                      <formRequest.Field
                        name='protocolNumber'
                        validators={{
                          // NOTE: Double check this validator. `schemaZodRequisicoesSipac.shape.newReq`
                          // seems unusual for a protocol number string. It might be `schemaZodRequisicoesSipac.shape.numeroAno`
                          // or a direct `z.string().min(1, 'Número obrigatório')`.
                          // Assumindo que schemaZodRequisicoesSipac.shape.newReq é o correto para validação
                          onBlur: schemaZodRequisicoesSipac.shape.newReq
                        }}
                      >
                        {(field) => (
                          <FormInputField
                            field={field}
                            label='Número da Requisição de Material'
                            type='tel'
                            placeholder='Digite o número...'
                            showLabel={true}
                            className='w-full'
                            onValueBlurParser={(value) =>
                              formatRequestNumber(value)
                            }
                          />
                        )}
                      </formRequest.Field>
                      <Button
                        className='mt-6 self-start'
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          fieldArray.pushValue({
                            protocolNumber: formatRequestNumber(
                              formRequest.getFieldValue('protocolNumber')
                            )
                          })
                        }
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                    {JSON.stringify(fieldArray.state.value)}
                    {fieldArray.state.value.map((_, i) => {
                      return (
                        <formRequest.Field
                          key={i}
                          name={`protocols[${i}].protocolNumber`}
                        >
                          {(subField) => {
                            return (
                              <div>{JSON.stringify(subField.state.value)}</div>
                            );
                          }}
                        </formRequest.Field>
                      );
                    })}
                  </div>
                )}
              </formRequest.Field>
              <formRequest.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    className='mt-6 self-start'
                    type='submit'
                    variant='outline'
                    size='sm'
                    disabled={
                      !canSubmit ||
                      isSubmitting || // isSubmitting do tanstack form (se o handler estiver rodando)
                      isPendingTransition // Nosso estado global de transição
                    }
                  >
                    {isSubmitting || isPendingTransition ? (
                      'Verificando...'
                    ) : (
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-gray-900'>Importar</span>{' '}
                        <Search className='h-4 w-4' />
                      </div>
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
