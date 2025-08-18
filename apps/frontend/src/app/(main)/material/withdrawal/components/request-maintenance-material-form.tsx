'use client';

import { useActionState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FormDropdown,
  FormInputField
} from '@/components/form-tanstack/form-input-fields';
import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { z } from 'zod';
import { IActionResultForm } from '@/types/types-server-actions';
import { formatRequestNumber } from '@/lib/form-utils';
import { RefreshCcw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRef } from 'react';
import { handleMaintenanceRequestSearch } from '../../../maintenance/request/maintenance-request-actions';
import { IMaintenanceRequestWithRelations } from '../../../maintenance/request/request-types';
import { schemaZodRequisicoesSipac } from '@/lib/schema-zod-requisicoes-sipac';
import { fetchOneAndPersistSipacRequisicoesManutencao } from '../../../sipac/requisicoes-manutencoes/requisicoes-manutencoes-actions';
import { ISipacRequisicaoManutencaoWithRelations } from '../../../sipac/requisicoes-manutencoes/requisicoes-manutencoes-types';
import { format } from 'date-fns';
import { IMaterialRequestWithRelations } from '../../request/material-request-types';
import { handleFetchRequisicaoMaterialComRequisicaoManutencaoVinculada } from '../../../sipac/requisicoes-materiais/requisicoes-materiais-actions';
import { ISipacRequisicaoMaterialWithRelations } from '../../../sipac/requisicoes-materiais/requisicoes-materiais-types';
import { handleMaterialRequestSearch } from '../../request/material-request-actions';

interface IRequestDataSearch {
  requestType: string;
  requestProtocolNumber: string;
}

const initialServerStateRequestMaintenance: IActionResultForm<
  IRequestDataSearch,
  IMaintenanceRequestWithRelations
> = {
  isSubmitSuccessful: false,
  message: '',
  submissionAttempts: 0
};

const initialServerStateScrapingManutencao: IActionResultForm<
  { numeroAno: string },
  ISipacRequisicaoManutencaoWithRelations
> = {
  isSubmitSuccessful: false,
  message: '',
  submissionAttempts: 0
};

const initialServerStateRequestMaterial: IActionResultForm<
  IRequestDataSearch,
  IMaterialRequestWithRelations
> = {
  isSubmitSuccessful: false,
  message: '',
  submissionAttempts: 0
};

const initialServerStateScrapingMaterial: IActionResultForm<
  { numeroAno: string },
  ISipacRequisicaoMaterialWithRelations
> = {
  isSubmitSuccessful: false,
  message: '',
  submissionAttempts: 0
};

const fieldLabelsRequestData: IRequestDataSearch = {
  requestType: 'Tipo de requisição',
  requestProtocolNumber: 'Número da requisição'
};

const defaultDataRequest: IRequestDataSearch = {
  requestType: 'maintenanceRequest',
  requestProtocolNumber: ''
};

export function RequestMaintenanceMaterialForm({
  setMaintenanceRequestData,
  maintenanceRequestData,
  setMaterialRequestData,
  materialRequestData
}: {
  setMaintenanceRequestData: React.Dispatch<
    React.SetStateAction<IMaintenanceRequestWithRelations | null>
  >;
  maintenanceRequestData?: IMaintenanceRequestWithRelations | null;
  setMaterialRequestData: React.Dispatch<
    React.SetStateAction<IMaterialRequestWithRelations | null>
  >;
  materialRequestData?: IMaterialRequestWithRelations | null;
}) {
  // Estado referente ao formulário de consulta da requisição de manutenção SISMAN
  const [
    serverStateMaintenanceSearch,
    formActionMaintenanceSearch,
    isPendingMaintenanceSearch
  ] = useActionState(
    handleMaintenanceRequestSearch,
    initialServerStateRequestMaintenance
  );

  // Estado referente ao formulário de scraping da requisição de manutenção SIPAC
  const [
    serverStateScrapingManutencao,
    formActionScrapingManutencao,
    isPendingScrapingManutencao
  ] = useActionState(
    fetchOneAndPersistSipacRequisicoesManutencao,
    initialServerStateScrapingManutencao
  );
  // Estado referente ao formulário de consulta da requisição de manutenção SISMAN
  const [
    serverStateMaterialSearch,
    formActionMaterialSearch,
    isPendingMaterialSearch
  ] = useActionState(
    handleMaterialRequestSearch,
    initialServerStateRequestMaterial
  );

  // Estado referente ao formulário de scraping da requisição de manutenção SIPAC
  const [
    serverStateScrapingMaterial,
    formActionScrapingMaterial,
    isPendingScrapingMaterial
  ] = useActionState(
    handleFetchRequisicaoMaterialComRequisicaoManutencaoVinculada,
    initialServerStateScrapingMaterial
  );

  const [isPendingTransition, startTransition] = useTransition();

  const lastMessageSearchMaintenanceSismanRef = useRef('');
  const lastMessageScrapingManutencaoSipacRef = useRef('');
  const lastMessageSearchMaterialSismanRef = useRef('');
  const lastMessageScrapingMaterialSipacRef = useRef('');

  //atualização do estado da maintenanceRequest sisman
  useEffect(() => {
    if (!isPendingMaintenanceSearch && serverStateMaintenanceSearch?.message) {
      if (
        serverStateMaintenanceSearch.message !==
        lastMessageSearchMaintenanceSismanRef.current
      ) {
        if (serverStateMaintenanceSearch.isSubmitSuccessful) {
          toast.success(serverStateMaintenanceSearch.message);
          setMaintenanceRequestData(
            serverStateMaintenanceSearch.responseData || null
          );
        } else {
          toast.warning(
            `Requisição de nº ${serverStateMaintenanceSearch.submittedData?.requestProtocolNumber} não encontrada. Será realizada uma tentativa de importação via SIPAC. Favor aguarde.`
          );
          setMaintenanceRequestData(null);

          // se o statusCode for 404, vamos tentar importar do api-scraping
          if (
            serverStateMaintenanceSearch.statusCode === 404 &&
            !isPendingTransition
          ) {
            console.log('iniciar importação');
            startTransition(() => {
              formActionScrapingManutencao({
                numeroAno: serverStateMaintenanceSearch.submittedData
                  ?.requestProtocolNumber as string
              });
            });
          }
          lastMessageSearchMaintenanceSismanRef.current =
            serverStateMaintenanceSearch.message;
        }
      }
    }
  }, [
    isPendingMaintenanceSearch,
    serverStateMaintenanceSearch,
    setMaintenanceRequestData
  ]);

  //atualizacao de estado de requisicaod de manutencao scraping sipac
  useEffect(() => {
    if (
      !isPendingScrapingManutencao &&
      serverStateScrapingManutencao?.message
    ) {
      if (
        serverStateScrapingManutencao.message !==
        lastMessageScrapingManutencaoSipacRef.current
      ) {
        if (serverStateScrapingManutencao.isSubmitSuccessful) {
          toast.success(
            `Requisicão nº ${serverStateScrapingManutencao.submittedData?.numeroAno} importada com sucesso!`
          );
          startTransition(() => {
            formActionMaintenanceSearch(
              serverStateMaintenanceSearch.submittedData as IRequestDataSearch
            );
          });
        } else {
          toast.error(serverStateScrapingManutencao.message);
        }
        lastMessageScrapingManutencaoSipacRef.current =
          serverStateScrapingManutencao.message;
      }
    }
  }, [isPendingScrapingManutencao, serverStateScrapingManutencao]);

  //atualização do estado da materialRequest sisman
  useEffect(() => {
    if (!isPendingMaterialSearch && serverStateMaterialSearch?.message) {
      if (
        serverStateMaterialSearch.message !==
        lastMessageSearchMaterialSismanRef.current
      ) {
        if (serverStateMaterialSearch.isSubmitSuccessful) {
          toast.success(serverStateMaterialSearch.message);
          setMaterialRequestData(
            serverStateMaterialSearch.responseData || null
          );

          if (
            serverStateMaterialSearch.responseData?.maintenanceRequest
              ?.protocolNumber
          ) {
            startTransition(() => {
              formActionMaintenanceSearch({
                requestType: 'maintenanceRequest',
                requestProtocolNumber: serverStateMaterialSearch.responseData
                  ?.maintenanceRequest?.protocolNumber as string
              });
            });
          }
        } else {
          toast.warning(
            `Requisição de nº ${serverStateMaterialSearch.submittedData?.requestProtocolNumber} não encontrada. Será realizada uma tentativa de importação via SIPAC. Favor aguarde.`
          );
          setMaterialRequestData(null);

          // se o statusCode for 404, vamos tentar importar do api-scraping
          if (
            serverStateMaterialSearch.statusCode === 404 &&
            !isPendingTransition
          ) {
            console.log('iniciar importação');
            startTransition(() => {
              formActionScrapingMaterial({
                numeroAno: serverStateMaterialSearch.submittedData
                  ?.requestProtocolNumber as string
              });
            });
          }
          lastMessageSearchMaterialSismanRef.current =
            serverStateMaterialSearch.message;
        }
      }
    }
  }, [
    isPendingMaterialSearch,
    serverStateMaterialSearch,
    setMaterialRequestData
  ]);

  //atualizacao de estado de requisicao de material scraping sipac
  useEffect(() => {
    if (!isPendingScrapingMaterial && serverStateScrapingMaterial?.message) {
      if (
        serverStateScrapingMaterial.message !==
        lastMessageScrapingMaterialSipacRef.current
      ) {
        if (serverStateScrapingMaterial.isSubmitSuccessful) {
          toast.success(
            `Requisicão nº ${serverStateScrapingMaterial.submittedData?.numeroAno} importada com sucesso!`
          );
          startTransition(() => {
            formActionMaterialSearch(
              serverStateMaterialSearch.submittedData as IRequestDataSearch
            );
          });
        } else {
          toast.error(serverStateScrapingMaterial.message);
        }
        lastMessageScrapingMaterialSipacRef.current =
          serverStateScrapingMaterial.message;
      }
    }
  }, [isPendingScrapingMaterial, serverStateScrapingMaterial]);

  //Formulario de consulta de informações da requisição de manutenção ou material
  const formRequest = useForm({
    defaultValues: defaultDataRequest,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverStateMaintenanceSearch ?? {}),
      [serverStateMaintenanceSearch]
    ),
    onSubmit: async ({ value }) => {
      //limpar dados
      setMaintenanceRequestData(null);
      setMaterialRequestData(null);

      if (value.requestProtocolNumber) {
        value.requestProtocolNumber = formatRequestNumber(
          value.requestProtocolNumber
        );
        if (value.requestType === 'materialRequest') {
          startTransition(() => {
            formActionMaterialSearch(value);
          });
        } else if (value.requestType === 'maintenanceRequest') {
          startTransition(() => {
            formActionMaintenanceSearch(value);
          });
        }
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
            <CardTitle className='text-lg'>Número da Requisição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex justify-between'>
              <div className='flex items-baseline gap-4'>
                <formRequest.Field
                  name='requestType'
                  children={(field: any) => (
                    <FormDropdown
                      field={field}
                      label={fieldLabelsRequestData.requestType}
                      placeholder={fieldLabelsRequestData.requestType}
                      options={[
                        { value: 'maintenanceRequest', label: 'Manutenção' },
                        { value: 'materialRequest', label: 'Material' }
                        // { value: 'emergencyRequest', label: 'Emergencial' }
                      ]}
                      onValueChange={(value) => field.handleChange(value)}
                    />
                  )}
                />
                {/* <SearchInput
                    placeholder='Search for WO by number or person responsible'
                    onSearch={(value) => console.log('WO Search:', value)}
                  /> */}
                <formRequest.Field
                  name='requestProtocolNumber'
                  validators={{
                    onBlur: schemaZodRequisicoesSipac.shape.newReq
                  }}
                >
                  {(field) => (
                    <FormInputField
                      field={field}
                      label={fieldLabelsRequestData.requestProtocolNumber}
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
                      className='mt-6 self-start'
                      type='submit'
                      variant='outline'
                      size='sm'
                      disabled={
                        !canSubmit ||
                        isSubmitting ||
                        !isTouched ||
                        isPendingMaintenanceSearch ||
                        isPendingScrapingManutencao
                      }
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
              <div className='flex gap-4'>
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
                      disabled={isPendingScrapingManutencao}
                      onClick={() => {
                        startTransition(() => {
                          formActionScrapingManutencao({
                            numeroAno: maintenanceRequestData.protocolNumber
                          });
                        });
                      }}
                    >
                      <RefreshCcw className='mr-2 h-4 w-4' /> Sincronizar com
                      SIPAC
                    </Button>
                    <div>
                      {isPendingScrapingManutencao && (
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
                      disabled={isPendingScrapingMaterial}
                      onClick={() => {
                        startTransition(() => {
                          formActionScrapingMaterial({
                            numeroAno: materialRequestData.protocolNumber
                          });
                        });
                      }}
                    >
                      <RefreshCcw className='mr-2 h-4 w-4' /> Sincronizar com
                      SIPAC
                    </Button>
                    <div>
                      {isPendingScrapingMaterial && (
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
