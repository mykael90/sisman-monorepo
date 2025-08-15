'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FormDropdown,
  FormInputField
} from '@/components/form-tanstack/form-input-fields';
import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { IActionResultForm } from '@/types/types-server-actions';
import { formatRequestNumber } from '@/lib/form-utils';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRef } from 'react';
import { handleMaintenanceRequestSearch } from '../../../maintenance/request/request-actions';
import { IMaintenanceRequestWithRelations } from '../../../maintenance/request/request-types';
import { schemaZodRequisicoesSipac } from '@/lib/schema-zod-requisicoes-sipac';

interface IRequestDataSearch {
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

const fieldLabelsRequestData: IRequestDataSearch = {
  requestType: 'Tipo de requisição',
  requestProtocolNumber: 'Número da requisição'
};

const defaultDataRequest: IRequestDataSearch = {
  requestType: 'maintenanceRequest',
  requestProtocolNumber: ''
};

export function RequestMaintenanceMaterialForm({
  setMaintenanceRequestData
}: {
  setMaintenanceRequestData: React.Dispatch<
    React.SetStateAction<IMaintenanceRequestWithRelations | null>
  >;
}) {
  // Estado referente ao formulário de consulta da requisição
  const [serverStateDataSearch, formActionDataSearch, isPendingDataSearch] =
    useActionState(
      handleMaintenanceRequestSearch,
      initialServerStateRequestData
    );

  const lastMessageRef = useRef('');

  if (!isPendingDataSearch && serverStateDataSearch?.message) {
    if (serverStateDataSearch.message !== lastMessageRef.current) {
      if (serverStateDataSearch.isSubmitSuccessful) {
        toast.success(serverStateDataSearch.message);
        setMaintenanceRequestData(serverStateDataSearch.responseData || null);
      } else {
        toast.error(serverStateDataSearch.message);
        setMaintenanceRequestData(null);
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
