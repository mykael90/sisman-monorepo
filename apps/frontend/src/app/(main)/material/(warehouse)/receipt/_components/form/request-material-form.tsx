'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { useForm } from '@tanstack/react-form';
import { formatRequestNumber } from '@/lib/form-utils';
import { CheckCircle2, Plus, RefreshCcw, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Importa as funções originais das Server Actions
import { showMaterialRequestByProtocol } from '../../../../request/material-request-actions';
import { IMaterialRequestWithRelations } from '../../../../request/material-request-types';
import { schemaZodRequisicoesSipac } from '@/lib/schema-zod-requisicoes-sipac';
import { handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada } from '../../../../../sipac/requisicoes-materiais/requisicoes-materiais-actions';
import { ISipacRequisicaoMaterialWithRelations } from '../../../../../sipac/requisicoes-materiais/requisicoes-materiais-types';
import Loading from '@/components/loading';
interface RequestFormValues {
  protocolNumber: string;
  protocols: {
    protocolNumber: string;
    status: 'pending' | 'success' | 'failed';
    message?: string;
    data?:
      | IMaterialRequestWithRelations
      | ISipacRequisicaoMaterialWithRelations;
  }[];
}

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
    protocolsToScrape: string[],
    form: typeof formRequest
  ) => {
    if (protocolsToScrape.length === 0) return;

    const results = await Promise.allSettled(
      protocolsToScrape.map((protocol) =>
        handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada(
          protocol
        )
      )
    );

    const successfulScrapes: ISipacRequisicaoMaterialWithRelations[] = [];
    const failedProtocols: string[] = [];

    results.forEach((result, index) => {
      const protocolNumber = protocolsToScrape[index];
      const formProtocolIndex = form
        .getFieldValue('protocols')
        .findIndex((p) => p.protocolNumber === protocolNumber);

      if (result.status === 'fulfilled' && result.value) {
        successfulScrapes.push(result.value);
        // if (formProtocolIndex !== -1) {
        //   form.setFieldValue(
        //     `protocols[${formProtocolIndex}].status`,
        //     'success'
        //   );
        //   form.setFieldValue(
        //     `protocols[${formProtocolIndex}].data`,
        //     result.value
        //   );
        //   form.setFieldValue(
        //     `protocols[${formProtocolIndex}].message`,
        //     'Importada com sucesso'
        //   );
        // }
      } else {
        failedProtocols.push(protocolNumber);
        if (formProtocolIndex !== -1) {
          form.setFieldValue(
            `protocols[${formProtocolIndex}].status`,
            'failed'
          );
          form.setFieldValue(
            `protocols[${formProtocolIndex}].message`,
            'Falha na importação'
          );
        }
      }
    });

    if (successfulScrapes.length > 0) {
      startTransition(() => {
        toast.success(
          `${successfulScrapes.length} requisição(ões) de material importada(s) do SIPAC com sucesso.`
        );
        findOrImportMaterialRequest(
          successfulScrapes.map((req) => req.numeroDaRequisicao),
          form
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

  const findOrImportMaterialRequest = async (
    protocolsToFind: string[],
    form: typeof formRequest
  ) => {
    if (protocolsToFind.length === 0) return;

    const foundRequests: IMaterialRequestWithRelations[] = [];

    const results = await Promise.all(
      protocolsToFind.map((p) => showMaterialRequestByProtocol(p))
    );

    results.forEach((result, index) => {
      const protocolNumber = protocolsToFind[index];
      const formProtocolIndex = form
        .getFieldValue('protocols')
        .findIndex((p) => p.protocolNumber === protocolNumber);

      if (result) {
        foundRequests.push(result);
        if (formProtocolIndex !== -1) {
          form.setFieldValue(
            `protocols[${formProtocolIndex}].status`,
            'success'
          );
          form.setFieldValue(`protocols[${formProtocolIndex}].data`, result);
          form.setFieldValue(
            `protocols[${formProtocolIndex}].message`,
            'Encontrada com sucesso'
          );
        }
      } else {
        if (formProtocolIndex !== -1) {
          form.setFieldValue(
            `protocols[${formProtocolIndex}].status`,
            'failed'
          );
          form.setFieldValue(
            `protocols[${formProtocolIndex}].message`,
            'Não encontrada no SISMAN'
          );
        }
      }
    });

    if (foundRequests.length > 0) {
      startTransition(() => {
        setMaterialRequestsData(foundRequests);
        toast.success(
          `${foundRequests.length} requisição(ões) de material encontrada(s).`
        );
      });
    }
  };

  const handleRequestProtocols = (protocols: string[]) => {
    startTransition(async () => {
      setMaterialRequestsData(null);
      // formRequest.setFieldValue('protocols', []);
      // Resetar o status de todos os protocolos para 'pending' antes de iniciar
      formRequest.setFieldValue(
        'protocols',
        formRequest.getFieldValue('protocols').map((p) => ({
          ...p,
          status: 'pending',
          message: undefined,
          data: undefined
        }))
      );
      try {
        scrapeOrUpdateRequisicaoMaterialSipac(protocols, formRequest);
      } catch (error) {
        toast.error('Falha ao buscar requisição de material.');
      }
    });
  };

  const handleSubmit = (protocolNumber: string) => {
    formRequest.pushFieldValue('protocols', {
      protocolNumber: formatRequestNumber(protocolNumber),
      status: 'pending' // Define o status inicial como 'pending'
    });
    formRequest.setFieldValue('protocolNumber', ''); // Limpa o campo após adicionar
  };

  const formRequest = useForm<
    RequestFormValues,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >({
    defaultValues: { protocolNumber: '', protocols: [] },
    onSubmit: async ({ value }) => {
      handleSubmit(value.protocolNumber);
    }
  });

  if (isPendingTransition) return <Loading />;

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
        {/* {JSON.stringify(materialRequestsData)} */}
        {/* Request number */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              Consulta à Requisições de Materiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='items-top flex justify-between'>
              <div className='flex items-baseline gap-4'>
                <formRequest.Field
                  name='protocolNumber'
                  validators={
                    {
                      // NOTE: Double check this validator. `schemaZodRequisicoesSipac.shape.newReq`
                      // seems unusual for a protocol number string. It might be `schemaZodRequisicoesSipac.shape.numeroAno`
                      // or a direct `z.string().min(1, 'Número obrigatório')`.
                      // Assumindo que schemaZodRequisicoesSipac.shape.newReq é o correto para validação
                      // onBlur: schemaZodRequisicoesSipacNotRequired.shape.newReq
                    }
                  }
                >
                  {(field) => (
                    <FormInputField
                      field={field}
                      label='Número da Requisição de Material'
                      type='tel'
                      placeholder='Digite o número...'
                      showLabel={true}
                      className='w-full'
                      onValueBlurParser={(value) => formatRequestNumber(value)}
                    />
                  )}
                </formRequest.Field>
                <formRequest.Subscribe
                  selector={(state) => state.values.protocolNumber}
                >
                  {(protocolNumber) => (
                    <Button
                      className='mt-6 self-start'
                      type='submit'
                      variant='outline'
                      size='sm'
                      disabled={!protocolNumber} // Desabilita o botão se o campo estiver vazio
                    >
                      <Plus className='h-4 w-4' />
                    </Button>
                  )}
                </formRequest.Subscribe>
              </div>

              <Button
                className='mt-6 self-start'
                type='button'
                variant='outline'
                onClick={() =>
                  handleRequestProtocols(
                    formRequest
                      .getFieldValue('protocols')
                      .filter((p) => p.status === 'pending')
                      .map((p) => p.protocolNumber)
                  )
                }
                size='sm'
                disabled={
                  formRequest
                    .getFieldValue('protocols')
                    .filter((p) => p.status === 'pending').length === 0
                }
              >
                {isPendingTransition ? (
                  'Verificando...'
                ) : (
                  <div className='flex items-center gap-2'>
                    Importar
                    <Search className='h-4 w-4' />
                  </div>
                )}
              </Button>
            </div>
            <div>
              <hr className='my-4' />
              <formRequest.Field name='protocols' mode='array'>
                {(fieldArray) => (
                  <div className='flex flex-wrap gap-2'>
                    <span className='text-sm font-semibold text-gray-700'>
                      Importações:
                    </span>
                    {fieldArray.state.value.map((protocolEntry, i) => {
                      const { protocolNumber, status, message } = protocolEntry;
                      let variant:
                        | 'default'
                        | 'secondary'
                        | 'destructive'
                        | 'outline' = 'default';
                      let Icon = null;
                      switch (status) {
                        case 'success':
                          variant = 'success';
                          Icon = CheckCircle2;
                          break;
                        case 'failed':
                          variant = 'destructive';
                          Icon = XCircle;
                          break;
                        case 'pending':
                        default:
                          variant = 'outline';
                          break;
                      }
                      return (
                        <Badge
                          key={i}
                          variant={variant}
                          className='flex items-center gap-1'
                        >
                          {Icon && <Icon className='h-3 w-3' />}
                          {protocolNumber}
                          {message && (
                            <span className='ml-1 text-xs'>{`(${message})`}</span>
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </formRequest.Field>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
