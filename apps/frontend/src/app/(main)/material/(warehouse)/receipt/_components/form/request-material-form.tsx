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
import { ISipacRequisicaoMaterialWithRelations } from '../../../../../sipac/requisicoes-materiais/requisicoes-materiais-types';

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
    protocols: string | string[]
  ) => {
    const protocolArray = Array.isArray(protocols) ? protocols : [protocols];
    if (protocolArray.length === 0) return;

    const results = await Promise.allSettled(
      protocolArray.map((protocol) =>
        handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada(
          protocol
        )
      )
    );

    const successfulScrapes: ISipacRequisicaoMaterialWithRelations[] = [];
    const failedProtocols: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successfulScrapes.push(result.value);
      } else {
        failedProtocols.push(protocolArray[index]);
      }
    });

    if (successfulScrapes.length > 0) {
      startTransition(() => {
        toast.success(
          `${successfulScrapes.length} requisição(ões) de material importada(s) do SIPAC com sucesso.`
        );
        findOrImportMaterialRequest(
          successfulScrapes.map((req) => req.numeroDaRequisicao)
        );
      });
    }

    if (failedProtocols.length > 0) {
      toast.error(
        `Falha ao importar requisição(ões) ${failedProtocols.join(
          ', '
        )} do SIPAC. Verifique os dados e tente novamente.`
      );
    }
  };

  const findOrImportMaterialRequest = async (protocols: string | string[]) => {
    const protocolArray = Array.isArray(protocols) ? protocols : [protocols];
    if (protocolArray.length === 0) return;

    const foundRequests: IMaterialRequestWithRelations[] = [];
    const notFoundProtocols: string[] = [];

    const results = await Promise.all(
      protocolArray.map((p) => showMaterialRequestByProtocol(p))
    );

    results.forEach((result, index) => {
      if (result) {
        foundRequests.push(result);
      } else {
        notFoundProtocols.push(protocolArray[index]);
      }
    });

    if (foundRequests.length > 0) {
      startTransition(() => {
        setMaterialRequestsData(results);
        toast.success(
          `${foundRequests.length} requisição(ões) de material encontrada(s).`
        );
      });
    }
  };

  const handleSubmit = (protocols: string[]) => {
    // ---- Fluxo de Requisição de Material ----
    startTransition(async () => {
      setMaterialRequestsData(null);
      try {
        scrapeOrUpdateRequisicaoMaterialSipac(protocols);
      } catch (error) {
        toast.error('Falha ao buscar requisição de material.');
      }
    });
  };

  const formRequest = useForm({
    defaultValues: { protocolNumber: '', protocols: [] },
    onSubmit: async ({ value }) => {
      handleSubmit(value.protocols.map((p) => p.protocolNumber));
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
