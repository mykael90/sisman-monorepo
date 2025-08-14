'use client';

import { useActionState, startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FormDropdown,
  FormInputField
} from '../../../../../components/form-tanstack/form-input-fields';
import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { z } from 'zod';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { formatRequestNumber } from '../../../../../lib/form-utils';
import { Search } from 'lucide-react';
import { IMaterialRequest } from '../../request/request-types';
import { toast } from 'sonner';
import { useRef } from 'react';

const requestFormDataSchema = z.object({
  newReq: z
    .string()
    .min(1, 'Requerido')
    .regex(
      /^[0-9]{1,5}$|^[0-9]+[/]{1}[0-9]{4}$/,
      'Formato de requisição não permitido'
    )
});

interface IRequestDataSearch {
  requestType: string;
  requestProtocolNumber: string;
}

const initialServerStateRequestData: IActionResultForm<IRequestDataSearch> = {
  isSubmitSuccessful: false,
  message: ''
};

const fieldLabelsRequestData: IRequestDataSearch = {
  requestType: 'Tipo de requisição',
  requestProtocolNumber: 'Número da requisição'
};

const defaultDataRequest: IRequestDataSearch = {
  requestType: 'maintenanceRequest',
  requestProtocolNumber: ''
};

// Define interface for maintenance request data
export interface IMaintenanceRequestData {
  id?: number;
  description?: string;
  requestedAt?: string;
  sipacUnitRequesting?: {
    nomeUnidade?: string;
    sigla?: string;
  };
  sipacUserLoginRequest?: string;
  facilityComplex?: {
    name?: string;
  };
  space?: {
    name?: string;
  };
  building?: {
    name?: string;
    latitude?: number;
    longitude?: number;
  };
  local?: string;
  protocolNumber?: string;
  materialRequests?: IMaterialRequest[];
}

export function RequestMaintenanceMaterialForm({
  promiseMaintenanceRequest,
  setMaintenanceRequestData
}: {
  promiseMaintenanceRequest: (
    protocolNumber: string
  ) => Promise<IMaintenanceRequestData | null>;
  setMaintenanceRequestData: React.Dispatch<
    React.SetStateAction<IMaintenanceRequestData | null>
  >;
}) {
  const wrappedPromiseMaintenanceRequest = async (
    prevState: IActionResultForm<IRequestDataSearch>,
    formData: FormData | string
  ): Promise<IActionResultForm<IRequestDataSearch>> => {
    let protocolNumber: string | null = null;
    if (typeof formData === 'string') {
      protocolNumber = formData;
    } else if (formData instanceof FormData) {
      protocolNumber =
        formData.get('requestProtocolNumber')?.toString() || null;
    }

    if (!protocolNumber) {
      return {
        ...prevState,
        isSubmitSuccessful: false,
        message: 'Número de protocolo não fornecido.'
      };
    }

    try {
      const response = await promiseMaintenanceRequest(protocolNumber);
      if (response) {
        setMaintenanceRequestData(response);
        return {
          ...prevState,
          isSubmitSuccessful: true,
          message: 'Dados da requisição carregados com sucesso.',
          responseData: {
            requestType: 'maintenanceRequest',
            requestProtocolNumber: protocolNumber
          }
        };
      } else {
        return {
          ...prevState,
          isSubmitSuccessful: false,
          message: 'Requisição não encontrada ou dados inválidos.'
        };
      }
    } catch (error: any) {
      console.error('Error in wrappedPromiseMaintenanceRequest:', error);
      console.log(
        `AQUIIIII! Error in wrappedPromiseMaintenanceRequest: ${JSON.stringify(error, null, 2)}`
      );
      if (error?.statusCode === 404) {
        return {
          ...prevState,
          isSubmitSuccessful: false,
          message:
            'Requisição não encontrada. Favor verifique as informações e tente novamente.'
        };
      } else {
        // throw error;
      }
    }
  };

  // Estado referente ao formulário de consulta da requisição
  const [serverStateDataSearch, formActionDataSearch, isPendingDataSearch] =
    useActionState(
      wrappedPromiseMaintenanceRequest,
      initialServerStateRequestData
    );

  const lastMessageRef = useRef('');

  if (!isPendingDataSearch && serverStateDataSearch?.message) {
    if (serverStateDataSearch.message !== lastMessageRef.current) {
      if (serverStateDataSearch.isSubmitSuccessful) {
        toast.success(serverStateDataSearch.message);
      } else {
        toast.error(serverStateDataSearch.message);
      }
      lastMessageRef.current = serverStateDataSearch.message;
    }
  }

  const getRequestData = (value: IRequestDataSearch) => {
    if (value.requestType === 'maintenanceRequest') {
      return formatRequestNumber(value.requestProtocolNumber);
    } else if (value.requestType === 'materialRequest') {
      return null;
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
      const formattedRequestNumber = getRequestData(value);
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
            <CardTitle className='text-lg'>Número da Requisição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-end gap-4'>
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
                  onBlur: requestFormDataSchema.shape.newReq
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
