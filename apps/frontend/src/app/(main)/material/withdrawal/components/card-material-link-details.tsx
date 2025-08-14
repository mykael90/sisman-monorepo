'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '../../../../../components/ui/switch';
import { FormListBox } from '../../../../../components/form-tanstack/form-list-box';
import { Label } from '../../../../../components/ui/label';
import { format } from 'date-fns';
import { ItemsTableFormArray } from './items-table-form-array';
import { IMaintenanceRequestData } from './request-maintenance-material-form';

export function CardMaterialLinkDetails({
  linkMaterialRequest,
  setLinkMaterialRequest,
  formWithdrawal,
  setMaterialRequestDataLinked,
  materialRequestDataLinked,
  materialRequestData
}: {
  linkMaterialRequest: boolean;
  setLinkMaterialRequest: (value: boolean) => void;
  formWithdrawal: any;
  setMaterialRequestDataLinked: (value: any) => void;
  materialRequestDataLinked: any;
  materialRequestData: any;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-semibold'>
              Vincular Requisição de Material
            </h2>
            <Switch
              checked={linkMaterialRequest}
              onCheckedChange={setLinkMaterialRequest}
              aria-label='Vincular Requisição de Material'
            />
          </div>
        </CardTitle>
      </CardHeader>
      {linkMaterialRequest && (
        <CardContent className='space-y-4'>
          <>
            <formWithdrawal.Field
              name='materialRequestId'
              children={(field) => (
                <FormListBox
                  field={field}
                  label='Requisições de Material Disponíveis'
                  options={[
                    {
                      value: '1',
                      label: 'Requisição 16349/2025 - Manutenção'
                    },
                    {
                      value: '2',
                      label: 'Requisição 12345/2024 - TI'
                    },
                    {
                      value: '3',
                      label: 'Requisição 20001/2025 - Elétrica'
                    },
                    {
                      value: '4',
                      label: 'Requisição 20002/2025 - Hidráulica'
                    },
                    {
                      value: '5',
                      label: 'Requisição 20003/2025 - Civil'
                    },
                    {
                      value: '6',
                      label: 'Requisição 20004/2025 - Mecânica'
                    },
                    {
                      value: '7',
                      label: 'Requisição 20005/2025 - Limpeza'
                    },
                    {
                      value: '8',
                      label: 'Requisição 20006/2025 - Informática'
                    },
                    {
                      value: '9',
                      label: 'Requisição 20007/2025 - Segurança'
                    },
                    {
                      value: '10',
                      label: 'Requisição 20008/2025 - Transporte'
                    }
                  ]}
                  onValueChange={(value) => {
                    // Simulate fetching data based on selected requisition
                    if (value === '1') {
                      setMaterialRequestDataLinked({
                        protocolNumber: '16349/2025',
                        sipacUserLoginRequest: 'eduardo.kennedi',
                        requestValue: '77.97',
                        servedValue: '77.97',
                        currentStatus: 'FULLY_ATTENDED',
                        requestDate: '2025-06-04T00:00:00.000-03:00',
                        itemsBalance: [
                          {
                            globalMaterialId: '302400026133',
                            materialRequestItemId: 247,
                            quantityRequested: '1',
                            quantityApproved: '1',
                            quantityReceivedSum: '0',
                            quantityWithdrawnSum: '0',
                            quantityReserved: '0',
                            quantityRestricted: '0',
                            quantityFreeBalanceEffective: '0',
                            quantityFreeBalancePotential: '1'
                          }
                        ]
                      });
                    } else {
                      setMaterialRequestDataLinked(null);
                    }
                  }}
                />
              )}
            />
            {materialRequestDataLinked && (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>Número do Protocolo</Label>
                    <p className='text-muted-foreground'>
                      {materialRequestDataLinked.protocolNumber}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Login do Usuário SIPAC</Label>
                    <p className='text-muted-foreground'>
                      {materialRequestDataLinked.sipacUserLoginRequest}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Valor da Requisição</Label>
                    <p className='text-muted-foreground'>
                      R$ {materialRequestDataLinked.requestValue}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Valor Atendido</Label>
                    <p className='text-muted-foreground'>
                      R$ {materialRequestDataLinked.servedValue}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Status Atual</Label>
                    <p className='text-muted-foreground'>
                      {materialRequestDataLinked.currentStatus}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Data da Requisição</Label>
                    <p className='text-muted-foreground'>
                      {format(
                        new Date(materialRequestDataLinked.requestDate),
                        'PPP'
                      )}
                    </p>
                  </div>
                </div>
                <h3 className='text-md font-semibold'>Itens da Requisição</h3>
                <ItemsTableFormArray
                  materials={materialRequestDataLinked.itemsBalance.map(
                    (item: any) => ({
                      id: item.materialRequestItemId,
                      code: item.globalMaterialId,
                      description: 'Material Description (Placeholder)', // You might need to fetch this based on globalMaterialId
                      unit: 'UN', // Placeholder
                      freeBalanceQuantity: parseInt(
                        item.quantityFreeBalancePotential
                      ),
                      qtyToRemove: parseInt(item.quantityRequested)
                    })
                  )}
                  onRemove={() => {}} // No remove action for linked items
                  onUpdateQuantity={() => {}} // No quantity update for linked items
                  readOnly={false} // Make quantity editable for linked items
                />
              </div>
            )}
          </>
        </CardContent>
      )}
    </Card>
  );
}
