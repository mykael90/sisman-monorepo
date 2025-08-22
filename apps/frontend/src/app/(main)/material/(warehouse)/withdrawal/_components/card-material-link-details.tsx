'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { FormListBox } from '@/components/form-tanstack/form-list-box';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { TableFormItemsGlobal } from './form/table-form-items-global';
import { startTransition, useState, useEffect } from 'react';
import { IActionResultForm } from '../../../../../../types/types-server-actions';
import { handleMaterialRequestBalanceSearch } from '../../../request/material-request-actions';
import {
  IItemMaterialRequestBalance,
  IMaterialRequestBalanceWithRelations
} from '../../../request/material-request-types';
import { TableFormItemsMaterialRequest } from './form/table-form-items-material-request';
import { IWithdrawalFormApi } from '../../../../../../hooks/use-withdrawal-form';
import { IMaterialWithdrawalItemAddForm } from '../withdrawal-types';

const initialServerStateRequestMaterialBalance: IActionResultForm<
  string,
  IMaterialRequestBalanceWithRelations
> = {
  isSubmitSuccessful: false,
  message: '',
  submissionAttempts: 0
};

export type IItemWithdrawalMaterialRequestForm =
  IMaterialWithdrawalItemAddForm &
    Partial<
      Pick<
        IItemMaterialRequestBalance,
        | 'quantityApproved'
        | 'quantityReceivedSum'
        | 'quantityWithdrawnSum'
        | 'quantityReserved'
        | 'quantityRestricted'
        | 'quantityFreeBalanceEffective'
        | 'quantityFreeBalancePotential'
        | 'quantityRequested'
        | 'materialRequestItemId'
      >
    >;

export type IMaterialRequestBalanceWithRelationsForm = Omit<
  IMaterialRequestBalanceWithRelations,
  'itemsBalance'
> & {
  itemsBalance: IItemWithdrawalMaterialRequestForm[];
};

export function CardMaterialRequestLinkDetails({
  linkMaterialRequest,
  setLinkMaterialRequest,
  formWithdrawal,
  materialRequestDataLinked,
  setFieldValue
}: {
  linkMaterialRequest: boolean;
  setLinkMaterialRequest: (value: boolean) => void;
  formWithdrawal: IWithdrawalFormApi;
  materialRequestDataLinked: any;
  setFieldValue: IWithdrawalFormApi['setFieldValue'];
}) {
  const [materialRequestBalance, setMaterialRequestBalance] =
    useState<IMaterialRequestBalanceWithRelationsForm | null>(null);

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
          <div className='flex flex-col gap-4 md:flex-row'>
            {/* {JSON.stringify(materialRequestBalance)} */}
            <div className='w-full md:w-1/4'>
              <formWithdrawal.Field
                name='materialRequestId'
                children={(field) => (
                  <FormListBox
                    field={field}
                    label='Requisições de Material Associadas'
                    placeholder='Filtrar requisições...'
                    notFoundMessage='Nenhuma requisição encontrada.'
                    options={materialRequestDataLinked?.map(
                      (item: IMaterialRequestBalanceWithRelations) => ({
                        value: item.id,
                        label: `${item.protocolNumber} (${item.sipacUserLoginRequest})`
                      })
                    )}
                    onValueChange={(value) => {
                      // Simulate fetching data based on selected requisition
                      //TODO: implementar logica
                      if (value) {
                        startTransition(async () => {
                          const response =
                            await handleMaterialRequestBalanceSearch(
                              initialServerStateRequestMaterialBalance,
                              value
                            );
                          if (
                            response.isSubmitSuccessful &&
                            response.responseData
                          ) {
                            const newMaterialRequestBalance = {
                              ...response.responseData,
                              itemsBalance:
                                response.responseData.itemsBalance?.map(
                                  (item) => ({
                                    ...item,
                                    quantityWithdrawn: Number(
                                      item.quantityFreeBalancePotential
                                    ),
                                    key: Date.now() + Math.random()
                                  })
                                )
                            };
                            setMaterialRequestBalance(
                              newMaterialRequestBalance
                            );
                            setFieldValue(
                              'items',
                              newMaterialRequestBalance.itemsBalance?.map(
                                (
                                  item: IItemWithdrawalMaterialRequestForm
                                ): IItemWithdrawalMaterialRequestForm => ({
                                  key: item.key,
                                  name: item.name,
                                  globalMaterialId: item.globalMaterialId,
                                  materialInstanceId: undefined, // Assuming global material for now
                                  description: item.description,
                                  unitOfMeasure: item.unitOfMeasure,
                                  quantityWithdrawn: Number(
                                    item.quantityFreeBalancePotential
                                  ),
                                  freeBalanceQuantity: Number(
                                    item.quantityFreeBalancePotential
                                  ), // Adicionado para corresponder ao tipo
                                  physicalOnHandQuantity: Number(
                                    item.quantityFreeBalanceEffective
                                  ),
                                  materialRequestItemId:
                                    item.materialRequestItemId
                                })
                              )
                            );
                          }
                        });
                      }
                    }}
                    showLabel={false}
                  />
                )}
              />
            </div>
            {materialRequestBalance && (
              <div className='w-full'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label>Número do Protocolo</Label>
                    <p className='text-muted-foreground'>
                      {materialRequestBalance.protocolNumber}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Login do Usuário SIPAC</Label>
                    <p className='text-muted-foreground'>
                      {materialRequestBalance.sipacUserLoginRequest}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Valor da Requisição</Label>
                    <p className='text-muted-foreground'>
                      R${' '}
                      {Number(materialRequestBalance.requestValue).toFixed(2)}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Valor Atendido</Label>
                    <p className='text-muted-foreground'>
                      R$ {Number(materialRequestBalance.servedValue).toFixed(2)}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Status Atual</Label>
                    <p className='text-muted-foreground'>
                      {materialRequestBalance.currentStatus}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Data da Requisição</Label>
                    <p className='text-muted-foreground'>
                      {format(new Date(), 'PPP')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {materialRequestBalance && (
            <div>
              <h3 className='text-md font-semibold'>Itens da Requisição</h3>
              <formWithdrawal.Field
                name='items'
                mode='array'
                children={(field) => {
                  const handleRemoveMaterial = (key: number) => {
                    const index = field.state.value.findIndex(
                      (m: IMaterialWithdrawalItemAddForm) => m.key === key
                    );
                    if (index !== -1) {
                      field.removeValue(index);
                    }
                  };

                  const handleUpdateQuantity = (
                    key: number,
                    quantity: number
                  ) => {
                    const index = field.state.value.findIndex(
                      (m: IMaterialWithdrawalItemAddForm) => m.key === key
                    );
                    if (index !== -1) {
                      const updatedMaterial = {
                        ...field.state.value[index],
                        quantityWithdrawn: quantity
                      };
                      field.replaceValue(index, updatedMaterial);
                    }
                  };
                  return (
                    <TableFormItemsMaterialRequest
                      materialsInfo={
                        materialRequestBalance?.itemsBalance.map(
                          (item: IItemWithdrawalMaterialRequestForm) => ({
                            key: item.key,
                            name: item.name,
                            globalMaterialId: item.globalMaterialId,
                            materialInstanceId: undefined, // Assuming global material for now
                            description: item.description,
                            unitOfMeasure: item.unitOfMeasure, // You might need to fetch this based on globalMaterialId
                            quantityWithdrawn: 1, // Default quantity
                            quantityFreeBalancePotential: Number(
                              item.quantityFreeBalancePotential
                            ),
                            quantityRequested: Number(item.quantityRequested),
                            quantityApproved: Number(item.quantityApproved),
                            quantityReceivedSum: Number(
                              item.quantityReceivedSum
                            ),
                            quantityWithdrawnSum: Number(
                              item.quantityWithdrawnSum
                            ),
                            quantityReserved: Number(item.quantityReserved),
                            quantityRestricted: Number(item.quantityRestricted),
                            quantityFreeBalanceEffective: Number(
                              item.quantityFreeBalanceEffective
                            )
                          })
                        ) as IItemWithdrawalMaterialRequestForm[]
                      }
                      materials={field.state.value}
                      onRemove={handleRemoveMaterial} // No remove action for linked items
                      onUpdateQuantity={handleUpdateQuantity} // No quantity update for linked items
                      readOnly={false} // Make quantity editable for linked items
                    />
                  );
                }}
              ></formWithdrawal.Field>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
