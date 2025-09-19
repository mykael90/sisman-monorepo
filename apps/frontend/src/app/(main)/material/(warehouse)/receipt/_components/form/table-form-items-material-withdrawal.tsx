'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Minus, Plus } from 'lucide-react';
import { IMaterialReceiptItemAddForm } from '../../receipt-types';
import { useMemo } from 'react';
import { IMaterialGlobalCatalog } from '../../../../global-catalog/material-global-catalog-types';
import { formatToBRL } from '../../../../../../../lib/utils';
import { InfoHoverCard } from '../../../../../../../components/info-hover-card';
import { IMaterialWithdrawalItem } from '../../../withdrawal/withdrawal-types';
import { IMaterialReceiptItemAddFormInfo } from './table-form-items-material-request';

interface TableFormItemsMaterialWithdrawalProps {
  materialsInfo: IMaterialReceiptItemAddFormInfo[];
  materials: IMaterialReceiptItemAddForm[];
  onRemove: (key: number) => void;
  onUpdateItemQuantity: (
    key: number,
    quantity: number,
    type: 'quantityReceived' | 'quantityRejected'
  ) => void;
  hideMaterialWithdrawalItemId?: boolean;
  readOnly?: boolean;
}

export function TableFormItemsMaterialWithdrawal({
  materialsInfo,
  materials,
  onRemove,
  onUpdateItemQuantity,
  hideMaterialWithdrawalItemId,
  readOnly = false
}: TableFormItemsMaterialWithdrawalProps) {
  const infoMap = useMemo(() => {
    const map = new Map<number, IMaterialReceiptItemAddFormInfo>();

    if (Array.isArray(materialsInfo)) {
      materialsInfo.forEach((material) => {
        map.set(material.key, material);
      });
    }
    return map;
  }, [materialsInfo]);

  const materialsMap = useMemo(() => {
    const map = new Map<number, IMaterialReceiptItemAddForm>();
    if (Array.isArray(materials)) {
      materials.forEach((material) => {
        map.set(material.key, material);
      });
    }
    return map;
  }, [materials]);

  const getClampedQuantity = (
    material: IMaterialReceiptItemAddForm,
    newQuantity: number
  ): number => {
    const quantityExpected = Number(material.quantityExpected);
    const isQuantityExpectedDefined = !isNaN(quantityExpected);
    let quantity = Math.max(0, newQuantity);

    if (isQuantityExpectedDefined) {
      quantity = Math.min(quantityExpected, quantity);
    }

    return quantity;
  };

  const handleQuantityChange =
    (type: 'quantityReceived' | 'quantityRejected') =>
    (key: number, change: number) => {
      const material = materialsMap.get(key);
      if (material) {
        const newQuantity = Number(material[type]) + change;
        onUpdateItemQuantity(
          key,
          getClampedQuantity(material, newQuantity),
          type
        );
      }
    };

  const handleManualQuantityChange =
    (type: 'quantityReceived' | 'quantityRejected') =>
    (key: number, value: string) => {
      const material = materialsMap.get(key);
      if (!material) return;

      if (value === '') {
        onUpdateItemQuantity(key, 0, type);
        return;
      }

      const newQuantity = parseFloat(value.replace(',', '.'));
      if (!isNaN(newQuantity)) {
        onUpdateItemQuantity(
          key,
          getClampedQuantity(material, newQuantity),
          type
        );
      }
    };

  if (materials.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        {readOnly
          ? 'Nenhum material para esta entrada.'
          : 'Nenhum material adicionado, utilize a consulta da listagem para adicionar.'}
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-lg border'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='w-20 px-4 py-3 text-left text-sm font-medium text-gray-900'>
                ID Material
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Nome do Material
              </th>
              <th className='w-30 px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Unidade Medida
              </th>
              <th className='w-32 px-4 py-3 text-left text-sm font-medium text-gray-900'>
                R$ Unitário
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                Qtd. Esperada
              </th>
              <th className='w-40 px-4 py-3 text-center text-sm font-medium text-gray-900'>
                Rejeitar
              </th>
              <th className='w-40 px-4 py-3 text-center text-sm font-medium text-gray-900'>
                Receber
              </th>
              {!readOnly && (
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {materials.map((material) => {
              const info = infoMap.get(material.key);

              return (
                <tr key={material.key} className='hover:bg-gray-50'>
                  <td className='w-min px-4 py-3 text-sm font-medium text-gray-900'>
                    {material.materialId}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    <div className='flex items-center justify-start gap-2'>
                      {info?.name}
                      <InfoHoverCard
                        title='Descrição do Material'
                        content={info?.description}
                        className='w-200'
                      />
                    </div>
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {info?.unitOfMeasure}
                  </td>
                  <td className='px-4 py-3 text-right text-sm text-gray-900'>
                    {material.unitPrice?.toString ? (
                      <Badge variant={'secondary'}>
                        {Number(material.unitPrice).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </Badge>
                    ) : (
                      <Badge variant='outline'>Indefinido</Badge>
                    )}
                  </td>
                  <td className='px-4 py-3 text-right text-sm'>
                    <div className='flex items-center justify-center gap-2'>
                      <Badge variant='outline'>
                        {Number(material.quantityExpected).toLocaleString(
                          'pt-BR',
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2
                          }
                        )}
                      </Badge>
                      <InfoHoverCard
                        title='Cálculo da Quantidade Esperada'
                        subtitle='Movimentações referentes a requisição de material.'
                        content={
                          <>
                            <div className='flex justify-between'>
                              <span>Qtd. Aprovada:</span>
                              <span>{Number(info?.quantityApproved)}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span>Qtd. Recebida:</span>
                              <span>{Number(info?.quantityDelivered)}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span>Qtd. Retornada:</span>
                              <span>{Number(info?.quantityReturned)}</span>
                            </div>
                          </>
                        }
                      />
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    {readOnly ? (
                      <p className='text-gray-900'>
                        {Number(material.quantityRejected)}
                      </p>
                    ) : (
                      <div className='flex items-center justify-center gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            handleQuantityChange('quantityRejected')(
                              material.key,
                              -1
                            )
                          }
                          disabled={Number(material.quantityRejected) <= 0}
                        >
                          <Minus className='h-3 w-3' />
                        </Button>
                        <Input
                          type='number'
                          step='any'
                          value={String(material.quantityRejected)}
                          onChange={(e) =>
                            handleManualQuantityChange('quantityRejected')(
                              material.key,
                              e.target.value
                            )
                          }
                          className='w-18 text-center'
                          min='0'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            handleQuantityChange('quantityRejected')(
                              material.key,
                              1
                            )
                          }
                        >
                          <Plus className='h-3 w-3' />
                        </Button>
                      </div>
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {readOnly ? (
                      <p className='text-gray-900'>
                        {Number(material.quantityReceived)}
                      </p>
                    ) : (
                      <div className='flex items-center justify-center gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            handleQuantityChange('quantityReceived')(
                              material.key,
                              -1
                            )
                          }
                          disabled={Number(material.quantityReceived) <= 0}
                        >
                          <Minus className='h-3 w-3' />
                        </Button>
                        <Input
                          type='number'
                          step='any'
                          value={String(material.quantityReceived)}
                          onChange={(e) =>
                            handleManualQuantityChange('quantityReceived')(
                              material.key,
                              e.target.value
                            )
                          }
                          className='w-18 text-center'
                          min='0'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            handleQuantityChange('quantityReceived')(
                              material.key,
                              1
                            )
                          }
                        >
                          <Plus className='h-3 w-3' />
                        </Button>
                      </div>
                    )}
                  </td>
                  {!readOnly && (
                    <td className='px-4 py-3'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => onRemove(material.key)}
                        className='hover:bg-destructive text-destructive hover:text-white'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
