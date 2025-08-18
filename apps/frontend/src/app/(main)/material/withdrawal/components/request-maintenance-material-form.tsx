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
import { is } from 'date-fns/locale';

interface IRequestDataSearch {
  requestType: string;
  requestProtocolNumber: string;
}

const initialServerStateRequestData: IActionResultForm<
  IRequestDataSearch,
  IMaintenanceRequestWithRelations
> = {
  isSubmitSuccessful: false,
  message: '',
  submissionAttempts: 0
};

const initialServerStateScraping: IActionResultForm<
  { numeroAno: string },
  ISipacRequisicaoManutencaoWithRelations
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
  maintenanceRequestData
}: {
  setMaintenanceRequestData: React.Dispatch<
    React.SetStateAction<IMaintenanceRequestWithRelations | null>
  >;
  maintenanceRequestData?: IMaintenanceRequestWithRelations | null;
}) {
  // Estado referente ao formulário de consulta da requisição
  const [serverStateDataSearch, formActionDataSearch, isPendingDataSearch] =
    useActionState(
      handleMaintenanceRequestSearch,
      initialServerStateRequestData
    );

  const [
    serverStateDataScraping,
    formActionDataScraping,
    isPendingDataScraping
  ] = useActionState(
    fetchOneAndPersistSipacRequisicoesManutencao,
    initialServerStateScraping
  );

  const [isPendingTransition, startTransition] = useTransition();

  const lastMessageSearchSismanRef = useRef('');
  const lastMessageScrapingSipacRef = useRef('');

  useEffect(() => {
    if (!isPendingDataSearch && serverStateDataSearch?.message) {
      if (
        serverStateDataSearch.message !== lastMessageSearchSismanRef.current
      ) {
        if (serverStateDataSearch.isSubmitSuccessful) {
          toast.success(serverStateDataSearch.message);
          setMaintenanceRequestData(serverStateDataSearch.responseData || null);
        } else {
          toast.warning(
            `Requisição de nº ${serverStateDataSearch.submittedData?.requestProtocolNumber} não encontrada. Será realizada uma tentativa de importação via SIPAC. Favor aguarde.`
          );
          setMaintenanceRequestData(null);

          // se o statusCode for 404, vamos tentar importar do api-scraping
          if (
            serverStateDataSearch.statusCode === 404 &&
            !isPendingTransition
          ) {
            console.log('iniciar importação');
            startTransition(() => {
              formActionDataScraping({
                numeroAno: serverStateDataSearch.submittedData
                  ?.requestProtocolNumber as string
              });
            });
          }
          lastMessageSearchSismanRef.current = serverStateDataSearch.message;
        }
      }
    }
  }, [isPendingDataSearch, serverStateDataSearch, setMaintenanceRequestData]);

  useEffect(() => {
    if (!isPendingDataScraping && serverStateDataScraping?.message) {
      if (
        serverStateDataScraping.message !== lastMessageScrapingSipacRef.current
      ) {
        if (serverStateDataScraping.isSubmitSuccessful) {
          toast.success(
            `Requisicão nº ${serverStateDataScraping.submittedData?.numeroAno} importada com sucesso!`
          );
          startTransition(() => {
            formActionDataSearch(
              serverStateDataSearch.submittedData as IRequestDataSearch
            );
          });
        } else {
          toast.error(serverStateDataScraping.message);
        }
        lastMessageScrapingSipacRef.current = serverStateDataScraping.message;
      }
    }
  }, [isPendingDataScraping, serverStateDataScraping]);

  const getRequestData = (value: IRequestDataSearch) => {
    if (value.requestType === 'maintenanceRequest') {
      return formatRequestNumber(value.requestProtocolNumber);
    } else if (value.requestType === 'materialRequest') {
      return formatRequestNumber(value.requestProtocolNumber);
    } else {
      console.error('Invalid request type:', value.requestType);
    }
    return formatRequestNumber(value.requestProtocolNumber);
  };

  //Formulario de consulta de informações da requisição de manutenção ou material
  const formRequest = useForm({
    defaultValues: defaultDataRequest,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverStateDataSearch ?? {}),
      [serverStateDataSearch]
    ),
    onSubmit: async ({ value }) => {
      if (value.requestProtocolNumber) {
        value.requestProtocolNumber = getRequestData(value);
        startTransition(() => {
          formActionDataSearch(value);
        });
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
                        isPendingDataSearch ||
                        isPendingDataScraping
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
              {maintenanceRequestData?.origin === 'SIPAC' ? (
                <div className='flex flex-col items-center'>
                  <div className='text-muted-foreground pb-1 text-sm'>
                    Última sincronização:{' '}
                    {format(
                      new Date(maintenanceRequestData?.updatedAt),
                      'dd/MM/yyyy HH:mm'
                    )}
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={isPendingDataScraping}
                    onClick={() => {
                      startTransition(() => {
                        formActionDataScraping({
                          numeroAno: maintenanceRequestData.protocolNumber
                        });
                      });
                    }}
                  >
                    <RefreshCcw className='mr-2 h-4 w-4' /> Sincronizar com
                    SIPAC
                  </Button>
                  <div>
                    {isPendingDataScraping && (
                      <div className='text-muted-foreground pt-1 text-xs'>
                        Aguarde...
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
