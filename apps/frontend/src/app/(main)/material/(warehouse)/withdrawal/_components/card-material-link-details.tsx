'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { FormListBox } from '@/components/form-tanstack/form-list-box';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { startTransition, useState, useEffect } from 'react';
import { IActionResultForm } from '../../../../../../types/types-server-actions';
import { handleMaterialRequestBalanceSearch } from '../../../request/material-request-actions';
import {
  IItemMaterialRequestBalance,
  IMaterialRequestBalanceWithRelations
} from '../../../request/material-request-types';
import { IWithdrawalFormApi } from '../../../../../../hooks/use-withdrawal-form';
import { IMaterialWithdrawalItemAddForm } from '../withdrawal-types';
import { MaterialItemsMaterialRequestField } from './form/field-form-items-material-request-array';

const initialServerStateRequestMaterialBalance: IActionResultForm<
  string,
  IMaterialRequestBalanceWithRelations
> = {
  isSubmitSuccessful: false,
  message: '',
  submissionAttempts: 0
};

export type IItemWithdrawalMaterialRequestForm = Pick<
  IMaterialWithdrawalItemAddForm,
  'key'
> &
  Partial<IItemMaterialRequestBalance>;

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
  setFieldValue,
  setMaterialRequestBalance,
  materialRequestBalance
}: {
  linkMaterialRequest: boolean;
  setLinkMaterialRequest: (value: boolean) => void;
  formWithdrawal: IWithdrawalFormApi;
  materialRequestDataLinked: any;
  setFieldValue: IWithdrawalFormApi['setFieldValue'];
  setMaterialRequestBalance: React.Dispatch<
    React.SetStateAction<IMaterialRequestBalanceWithRelationsForm | null>
  >;
  materialRequestBalance: IMaterialRequestBalanceWithRelationsForm | null;
}) {
  const handleAddMaterialsFromRequest = (materialRequestId: string) => {
    if (materialRequestId) {
      startTransition(async () => {
        const response = await handleMaterialRequestBalanceSearch(
          initialServerStateRequestMaterialBalance,
          materialRequestId
        );
        if (response.isSubmitSuccessful && response.responseData) {
          const materialInfoBalance = {
            ...response.responseData,
            itemsBalance: response.responseData.itemsBalance?.map((item) => ({
              ...item,
              key: Date.now() + Math.random() //é necessário inserir uma chave para realizar operacoes na tabela (localizar o item)
            }))
          };
          setMaterialRequestBalance(materialInfoBalance);

          setFieldValue(
            'items',
            materialInfoBalance.itemsBalance?.map(
              (
                item: IItemWithdrawalMaterialRequestForm
              ): IMaterialWithdrawalItemAddForm => ({
                key: item.key,
                globalMaterialId: item.globalMaterialId,
                materialInstanceId: undefined, // Assuming global material for now
                quantityWithdrawn: Number(item.quantityBalancePotential),
                materialRequestItemId: item.materialRequestItemId,
                unitPrice: item.unitPrice
              })
            )
          );
        }
      });
    }
  };

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
              onCheckedChange={(e) => {
                setLinkMaterialRequest(e);
                if (!e) {
                  setMaterialRequestBalance(null);
                  setFieldValue('items', []);
                }
              }}
              aria-label='Vincular Requisição de Material'
            />
          </div>
        </CardTitle>
      </CardHeader>
      {linkMaterialRequest && (
        <CardContent className='space-y-4'>
          <div className='flex flex-col gap-4 md:flex-row'>
            {/* {JSON.stringify(materialRequestBalance)} */}
            <div className={`w-full md:w-1/4`}>
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
                    onValueChange={handleAddMaterialsFromRequest}
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
                  return (
                    <MaterialItemsMaterialRequestField
                      field={field}
                      materialRequestBalance={materialRequestBalance}
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
