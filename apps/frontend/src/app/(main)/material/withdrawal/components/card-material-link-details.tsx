'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { FormListBox } from '@/components/form-tanstack/form-list-box';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ItemsTableFormArray } from './form/items-table-form-array';
import { useState } from 'react';

export function CardMaterialRequestLinkDetails({
  linkMaterialRequest,
  setLinkMaterialRequest,
  formWithdrawal,
  materialRequestDataLinked
}: {
  linkMaterialRequest: boolean;
  setLinkMaterialRequest: (value: boolean) => void;
  formWithdrawal: any;
  materialRequestDataLinked: any;
}) {
  const [materialRequestBalance, setMaterialRequestBalance] =
    useState<any>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>
          {JSON.stringify(materialRequestDataLinked)}
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
                  options={materialRequestDataLinked?.map((item: any) => ({
                    value: item.id,
                    label: item.protocolNumber
                  }))}
                  onValueChange={(value) => {
                    // Simulate fetching data based on selected requisition
                    //TODO: implementar logica
                    if (true) {
                      setMaterialRequestBalance({
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
                    }
                  }}
                />
              )}
            />
            {materialRequestBalance && (
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
                      {format(new Date(), 'PPP')}
                    </p>
                  </div>
                </div>
                <h3 className='text-md font-semibold'>Itens da Requisição</h3>
                <ItemsTableFormArray
                  materials={materialRequestBalance.itemsBalance.map(
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
