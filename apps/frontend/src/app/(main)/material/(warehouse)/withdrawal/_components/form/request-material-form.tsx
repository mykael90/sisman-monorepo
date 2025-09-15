'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInputField } from '@/components/form-tanstack/form-input-fields';
import { useForm } from '@tanstack/react-form';
import { formatRequestNumber } from '@/lib/form-utils';
import { RefreshCcw, Search } from 'lucide-react';
import { toast } from 'sonner';

// Importa as funções originais das Server Actions
import { showMaterialRequestBalanceByProtocol } from '../../../../../material/request/material-request-actions';
import { IMaterialRequestBalanceWithRelations } from '../../../../../material/request/material-request-types';
import { schemaZodRequisicoesSipac } from '@/lib/schema-zod-requisicoes-sipac';
import { handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada } from '../../../../../sipac/requisicoes-materiais/requisicoes-materiais-actions';
import { format } from 'date-fns';
import { IMaintenanceRequestBalanceWithRelations } from '../../../../../maintenance/request/request-types';
import { showMaintenanceRequestBalanceByProtocol } from '../../../../../maintenance/request/maintenance-request-actions';
import { fetchOneAndPersistSipacRequisicoesManutencao } from '../../../../../sipac/requisicoes-manutencoes/requisicoes-manutencoes-actions';
import { IMaterialRequestBalanceWithRelationsForm } from '../card-material-link-details';
import { IWithdrawalFormApi } from '@/hooks/use-withdrawal-form';

export function RequestMaterialForm({
  setMaterialRequestData,
  materialRequestData,
  setMaintenanceRequestData,
  maintenanceRequestData,
  setMaterialRequestBalance,
  setFieldValue
}: {
  setMaterialRequestData: React.Dispatch<
    React.SetStateAction<IMaterialRequestBalanceWithRelations | null>
  >;
  materialRequestData?: IMaterialRequestBalanceWithRelations | null;
  setMaintenanceRequestData: React.Dispatch<
    React.SetStateAction<IMaintenanceRequestBalanceWithRelations | null>
  >;
  maintenanceRequestData?: IMaintenanceRequestBalanceWithRelations | null;
  setMaterialRequestBalance: React.Dispatch<
    React.SetStateAction<IMaterialRequestBalanceWithRelationsForm | null>
  >;
  setFieldValue: IWithdrawalFormApi['setFieldValue'];
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
        findOrImportMaterialRequestBalance(formattedProtocolNumber);
      });
    } else {
      toast.error(
        `Falha ao importar requisição de material nº ${formattedProtocolNumber} do SIPAC. Verifique os dados e tente novamente.`
      );
    }
  };

  const updateRequisicaoManutencaoSipac = async (
    formattedProtocolNumber: string
  ) => {
    const scrapingRequisicaoManutencaoSipac =
      await fetchOneAndPersistSipacRequisicoesManutencao(
        formattedProtocolNumber
      );
    if (scrapingRequisicaoManutencaoSipac) {
      // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:

      // setMaintenanceRequestData(scrapingRequisicaoManutencaoSipac);
      console.log(
        'Requisição de manutenção importada do SIPAC:',
        scrapingRequisicaoManutencaoSipac
      );
      startTransition(() => {
        //Uso de recursividade, como foi bem sucedido, vai localizar corretamente e vai exibir em tela na próxima chamada
        toast.success(
          `Requisição de manutenção nº ${formattedProtocolNumber} importada do SIPAC com sucesso!`
        );
        findMaintenanceRequest(formattedProtocolNumber);
      });
    } else {
      toast.error(
        `Falha ao importar requisição de manutenção nº ${formattedProtocolNumber} do SIPAC. Verifique os dados e tente novamente.`
      );
    }
  };

  const findMaintenanceRequest = async (formattedProtocolNumber: string) => {
    const maintenanceRequestResponse =
      await showMaintenanceRequestBalanceByProtocol(formattedProtocolNumber);
    if (maintenanceRequestResponse) {
      // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:
      startTransition(() => {
        setMaintenanceRequestData(maintenanceRequestResponse);
        toast.success('Requisição de manutenção encontrada.');
      });
    } else {
      toast.warning(
        `Requisição de número ${formattedProtocolNumber} não encontrada no SISMAN`
      );
    }
  };

  const findOrImportMaterialRequestBalance = async (
    formattedProtocolNumber: string
  ) => {
    const materialRequestResponse = await showMaterialRequestBalanceByProtocol(
      formattedProtocolNumber
    );
    if (materialRequestResponse) {
      // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:
      startTransition(() => {
        setMaterialRequestData(materialRequestResponse);
        toast.success('Requisição de material encontrada.');

        if (materialRequestResponse.maintenanceRequest?.protocolNumber) {
          findMaintenanceRequest(
            materialRequestResponse.maintenanceRequest.protocolNumber
          );
        }
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
      setMaterialRequestData(null);
      try {
        findOrImportMaterialRequestBalance(formattedProtocolNumber);
      } catch (error) {
        toast.error('Falha ao buscar requisição de material.');
      }
    });
  };

  const formRequest = useForm({
    defaultValues: { protocolNumber: '' },
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
        {/* Request number */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              Consulta à Requisição de Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='items-top flex justify-between'>
              <div className='flex items-baseline gap-4'>
                <div className='flex-grow'>
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
                </div>
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
                        <Search className='h-4 w-4' />
                      )}
                    </Button>
                  )}
                </formRequest.Subscribe>
              </div>
              <div className='hidden gap-4 lg:flex'>
                {maintenanceRequestData?.origin === 'SIPAC' ? (
                  <div className='flex flex-col self-end'>
                    <div className='text-muted-foreground pb-1 text-center text-sm'>
                      Última sincronização: <br />
                      Requisição de Manutenção <br />
                      {format(
                        new Date(maintenanceRequestData?.updatedAt),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      disabled={isPendingTransition}
                      onClick={() => {
                        console.log('Sincronizando com SIPAC...');
                        startTransition(() => {
                          updateRequisicaoManutencaoSipac(
                            maintenanceRequestData.protocolNumber
                          );
                        });
                      }}
                    >
                      <RefreshCcw className='mr-2 h-4 w-4' /> Sincronizar com
                      SIPAC
                    </Button>
                    <div>
                      {isPendingTransition && (
                        <div className='text-muted-foreground pt-1 text-xs'>
                          Aguarde...
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
                {materialRequestData?.origin === 'SIPAC' ? (
                  <div className='flex flex-col self-end'>
                    <div className='text-muted-foreground pb-1 text-center text-sm'>
                      Última sincronização: <br />
                      Requisição de Material <br />
                      {format(
                        new Date(materialRequestData?.updatedAt),
                        'dd/MM/yyyy HH:mm'
                      )}
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      disabled={isPendingTransition}
                      onClick={() => {
                        console.log('Sincronizando com SIPAC...');
                        startTransition(() => {
                          scrapeOrUpdateRequisicaoMaterialSipac(
                            materialRequestData.protocolNumber
                          );
                        });
                      }}
                    >
                      <RefreshCcw className='mr-2 h-4 w-4' /> Sincronizar com
                      SIPAC
                    </Button>
                    <div>
                      {isPendingTransition && (
                        <div className='text-muted-foreground pt-1 text-xs'>
                          Aguarde...
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
