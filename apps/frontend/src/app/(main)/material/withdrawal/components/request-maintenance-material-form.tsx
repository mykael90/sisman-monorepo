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
  promiseMaintenanceRequest: any;
  setMaintenanceRequestData: React.Dispatch<
    React.SetStateAction<IMaintenanceRequestData | null>
  >;
}) {
  // Estado referente ao formulário de consulta da requisição
  const [serverStateDataSearch, formActionDataSearch, isPendingDataSearch] =
    useActionState(promiseMaintenanceRequest, initialServerStateRequestData);

  // Função para buscar os dados referente a requisição de manutenção
  const handleRequestMaintenanceData = async (protocolNumber: string) => {
    startTransition(async () => {
      try {
        const response = await promiseMaintenanceRequest(protocolNumber); // Chama a Server Action
        setMaintenanceRequestData(response);
      } catch (error) {
        console.error('Error refreshing data:', error);
        // Lidar com erro
      }
    });
  };

  const getRequestData = (value: IRequestDataSearch) => {
    if (value.requestType === 'maintenanceRequest') {
      const requestNumberFormatted = formatRequestNumber(
        value.requestProtocolNumber
      );
      handleRequestMaintenanceData(requestNumberFormatted);
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
    onSubmit: ({ value }) => {
      console.log('Form submitted:', value);
      console.log(getRequestData(value));
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
