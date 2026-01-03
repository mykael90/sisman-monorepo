'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FormCombobox,
  FormDatePicker,
  FormDropdown,
  FormInputField
} from '@/components/form-tanstack/form-input-fields';
import { useForm } from '@tanstack/react-form';
import { formatRequestNumber } from '@/lib/form-utils';
import { Plus, RefreshCcw, Search } from 'lucide-react';
import { toast } from 'sonner';

// Importa as funções originais das Server Actions
import { showMaterialRequestBalanceByProtocol } from '../../../../request/material-request-actions';
import { IMaterialRequestBalanceWithRelations } from '../../../../request/material-request-types';
import { schemaZodRequisicoesSipac } from '@/lib/schema-zod-requisicoes-sipac';
import { handleFetchOneAndPersistRequisicaoMaterialComRequisicaoManutencaoVinculada } from '../../../../../sipac/requisicoes-materiais/requisicoes-materiais-actions';
import { format, startOfDay } from 'date-fns';
import { IMaintenanceRequestBalanceWithRelations } from '../../../../../maintenance/request/maintenance-request-types';
import { showMaintenanceRequestBalanceByProtocol } from '../../../../../maintenance/request/maintenance-request-actions';
import { fetchOneAndPersistSipacRequisicoesManutencao } from '../../../../../sipac/requisicoes-manutencoes/requisicoes-manutencoes-actions';
import {
  IItemPickingOrderMaterialRequestForm,
  IMaterialRequestBalanceWithRelationsForm
} from '../card-material-link-details';
import { IPickingOrderFormApi } from '@/hooks/use-picking-order-form';
import {
  fieldsLabelsPickingOrderForm,
  IMaterialPickingOrderItemAddForm,
  IMaterialPickingOrderRelatedData
} from '../../material-picking-order-types';
import Loading from '../../../../../../../components/loading';

export function RequestMaterialFormBulk({
  setDefaultDataMaterialsPickingOrders,
  relatedData
}: {
  setDefaultDataMaterialsPickingOrders: React.Dispatch<
    React.SetStateAction<
      Array<{
        maintenanceRequestData: IMaintenanceRequestBalanceWithRelations | null;
        materialRequestData: IMaterialRequestBalanceWithRelations | null;
        materialRequestBalance: IMaterialRequestBalanceWithRelationsForm | null;
        details: any;
      }>
    >
  >;
  relatedData: IMaterialPickingOrderRelatedData;
}) {
  const protocolNumberInputRef = useRef<HTMLInputElement>(null);
  const { listUsers, listWorkers } = relatedData;
  const [maintenanceRequestData, setMaintenanceRequestData] =
    useState<IMaintenanceRequestBalanceWithRelations | null>(null);


  const [materialRequestData, setMaterialRequestData] =
    useState<IMaterialRequestBalanceWithRelations | null>(null);

  const [materialRequestBalance, setMaterialRequestBalance] =
    useState<IMaterialRequestBalanceWithRelationsForm | null>(null);

  useEffect(() => {
    if (materialRequestData) {
      handleAddMaterialPickingOrder();
      clearStates();
    }
  }, [materialRequestData]);

  const handleAddMaterialPickingOrder = () => {
    const { protocolNumber, ...details } = formRequestBulk.state.values;

    const newItem = {
      maintenanceRequestData,
      materialRequestData,
      materialRequestBalance,
      details
    };

    setDefaultDataMaterialsPickingOrders((prev) => [...prev, newItem]);
  };

  const clearStates = () => {
    setMaintenanceRequestData(null);
    setMaterialRequestData(null);
    setMaterialRequestBalance(null);
    formRequestBulk.setFieldValue('protocolNumber', '');
    protocolNumberInputRef.current?.focus({ preventScroll: true });

    // formRequestBulk.reset();
  };

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

  // const updateRequisicaoManutencaoSipac = async (
  //   formattedProtocolNumber: string
  // ) => {
  //   const scrapingRequisicaoManutencaoSipac =
  //     await fetchOneAndPersistSipacRequisicoesManutencao(
  //       formattedProtocolNumber
  //     );
  //   if (scrapingRequisicaoManutencaoSipac) {
  //     // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:

  //     // setMaintenanceRequestData(scrapingRequisicaoManutencaoSipac);
  //     console.log(
  //       'Requisição de manutenção importada do SIPAC:',
  //       scrapingRequisicaoManutencaoSipac
  //     );
  //     startTransition(() => {
  //       //Uso de recursividade, como foi bem sucedido, vai localizar corretamente e vai exibir em tela na próxima chamada
  //       toast.success(
  //         `Requisição de manutenção nº ${formattedProtocolNumber} importada do SIPAC com sucesso!`
  //       );
  //       findMaintenanceRequest(formattedProtocolNumber);
  //     });
  //   } else {
  //     toast.error(
  //       `Falha ao importar requisição de manutenção nº ${formattedProtocolNumber} do SIPAC. Verifique os dados e tente novamente.`
  //     );
  //   }
  // };

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

        // para o card-material-link-details
        const materialInfoBalance = {
          ...materialRequestResponse,
          itemsBalance: materialRequestResponse.itemsBalance?.map((item) => ({
            ...item,
            key: Date.now() + Math.random() //é necessário inserir uma chave para realizar operacoes na tabela (localizar o item)
          }))
        };

        setMaterialRequestBalance(materialInfoBalance);

        // setFieldValue('materialRequestId', materialRequestResponse.id);

        // setFieldValue(
        //   'items',
        //   materialInfoBalance.itemsBalance?.map(
        //     (
        //       item: IItemPickingOrderMaterialRequestForm
        //     ): IMaterialPickingOrderItemAddForm => ({
        //       key: item.key,
        //       globalMaterialId: item.globalMaterialId,
        //       materialInstanceId: undefined, // Assuming global material for now
        //       quantityToPick: Number(item.quantityBalancePotential),
        //       materialRequestItemId: item.materialRequestItemId,
        //       unitPrice: item.unitPrice
        //     })
        //   )
        // );

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
      try {
        findOrImportMaterialRequestBalance(formattedProtocolNumber);
      } catch (error) {
        toast.error('Falha ao buscar requisição de material.');
      }
    });
  };

  const formRequestBulk = useForm({
    defaultValues: {
      protocolNumber: '',
      desiredPickupDate: startOfDay(new Date()),
      collectorType: 'worker',
      beCollectedByWorkerId: '',
      beCollectedByUserId: '',
      collectedByOther: ''
    },
    onSubmit: async ({ value }) => {
      handleSubmit(value.protocolNumber);
    }
  });

  if (isPendingTransition) return <Loading />;

  return (
    <form
      id='form-request-bulk'
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formRequestBulk.handleSubmit();
      }}
    >
      <div className='space-y-6'>
        {/* Request number */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              Consulta à Requisição de Material em Lote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 items-start gap-4 md:grid-cols-1'>
              <div>
                <formRequestBulk.Field
                  name='desiredPickupDate'
                  children={(field) => (
                    <FormDatePicker
                      field={field}
                      label={fieldsLabelsPickingOrderForm.desiredPickupDate}
                      mode='single'
                      placeholder='dd/MM/yyyy'
                      formatDate='PPPP'
                    />
                  )}
                />
              </div>
              {/* items-start, alinhar por cima devido aos informativos de erro que podem aparecer em função do valor inserido no campo */}
              <div className='flex flex-col gap-4 md:flex-row md:items-start'>
                <formRequestBulk.Field
                  name='collectorType'
                  children={(field) => (
                    <FormDropdown
                      field={field}
                      label={
                        fieldsLabelsPickingOrderForm.collectorType as string
                      }
                      placeholder={
                        fieldsLabelsPickingOrderForm.collectorType as string
                      }
                      options={[
                        { value: 'worker', label: 'Profissional' },
                        { value: 'user', label: 'Servidor' },
                        { value: 'other', label: 'Outro' }
                      ]}
                      onValueChange={(value) => field.handleChange(value)}
                      className='w-35'
                    />
                  )}
                />

                <div className='flex-1'>
                  <formRequestBulk.Subscribe
                    selector={(state) => state.values.collectorType}
                    children={(collectorType) => (
                      <>
                        <formRequestBulk.Field
                          name='beCollectedByWorkerId'
                          children={(field) => (
                            <FormCombobox
                              className={`${collectorType === 'worker' ? 'block' : 'hidden'}`}
                              key={field.name} // The key is still good practice
                              field={field}
                              label={`Nome do colaborador`}
                              placeholder='Selecione um colaborador'
                              options={
                                listWorkers?.map((worker) => ({
                                  value: worker.id,
                                  label: worker.name,
                                  secondaryLabel:
                                    worker.workerContracts[0]?.workerSpecialty
                                      ?.name
                                })) ?? []
                              }
                              onValueChange={(value) =>
                                field.handleChange(Number(value))
                              }
                            />
                          )}
                        />
                        <formRequestBulk.Field
                          name='beCollectedByUserId'
                          children={(field) => (
                            <FormCombobox
                              className={`${collectorType === 'user' ? 'block' : 'hidden'}`}
                              key={field.name} // The key is still good practice
                              field={field}
                              label={`Nome do servidor`}
                              placeholder='Selecione um servidor'
                              options={
                                listUsers?.map((user) => ({
                                  value: user.id,
                                  label: user.name
                                })) ?? []
                              }
                              onValueChange={(value) =>
                                field.handleChange(Number(value))
                              }
                            />
                          )}
                        />
                        <formRequestBulk.Field
                          name='collectedByOther'
                          children={(field) => (
                            <FormInputField
                              className={`${collectorType === 'other' ? 'block' : 'hidden'}`}
                              field={field}
                              label={
                                fieldsLabelsPickingOrderForm.collectedByOther
                              }
                              placeholder='Digite o nome completo'
                            />
                          )}
                        />
                      </>
                    )}
                  />
                </div>
              </div>
              <div className='items-top flex justify-between'>
                <div className='flex items-baseline gap-4'>
                  <div className='flex-grow'>
                    <formRequestBulk.Field
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
                          ref={protocolNumberInputRef}
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
                    </formRequestBulk.Field>
                  </div>
                  <formRequestBulk.Subscribe
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
                  </formRequestBulk.Subscribe>
                </div>
                {/* <div className='hidden gap-4 lg:flex'>
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
              </div> */}
              </div>
            </div>
            {/* <div>
              <Button
                className='mt-6 self-start'
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddMaterialPickingOrder}
              >
                Adicionar <Plus className='h-4 w-4' />
              </Button>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
