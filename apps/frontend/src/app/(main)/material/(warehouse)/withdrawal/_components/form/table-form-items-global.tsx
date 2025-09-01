'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Minus, Plus } from 'lucide-react';
import { IMaterialWithdrawalItemAddForm } from '../../withdrawal-types';
import { useMemo } from 'react';
import { IMaterialGlobalCatalog } from '../../../../global-catalog/material-global-catalog-types';
import {
  IWarehouseStock,
  IWarehouseStockIncludedComputed
} from '../../../warehouse-stock/warehouse-stock-types';
import { formatToBRL } from '../../../../../../../lib/utils';

export type IMaterialWithdrawalItemAddFormInfo = Pick<
  IMaterialWithdrawalItemAddForm,
  'key' | 'globalMaterialId'
> &
  Pick<IMaterialGlobalCatalog, 'description' | 'name' | 'unitOfMeasure'> &
  Pick<
    IWarehouseStockIncludedComputed,
    'freeBalanceQuantity' | 'physicalOnHandQuantity'
  >;

interface TableFormItemsGlobalProps {
  materialsInfo: IMaterialWithdrawalItemAddFormInfo[];
  materials: IMaterialWithdrawalItemAddForm[];
  onRemove: (key: number) => void;
  onUpdateQuantity: (key: number, quantity: number) => void;
  hideMaterialRequestItemId?: boolean;
  readOnly?: boolean;
}

export function TableFormItemsGlobal({
  materialsInfo,
  materials,
  onRemove,
  onUpdateQuantity,
  hideMaterialRequestItemId,
  readOnly = false
}: TableFormItemsGlobalProps) {
  // Criamos um mapa para busca rápida das informações.
  // Usamos `useMemo` para que este mapa seja criado apenas uma vez, e não a cada renderização.

  const infoMap = useMemo(() => {
    const map = new Map<number, IMaterialWithdrawalItemAddFormInfo>();

    // Adiciona uma verificação para garantir que materialsInfo é um array
    if (Array.isArray(materialsInfo)) {
      materialsInfo.forEach((material) => {
        map.set(material.key, material);
      });
    }
    return map;
  }, [materialsInfo]);

  const materialsMap = useMemo(() => {
    const map = new Map<number, IMaterialWithdrawalItemAddForm>();
    if (Array.isArray(materials)) {
      materials.forEach((material) => {
        map.set(material.key, material);
      });
    }
    return map;
  }, [materials]);

  // Exemplo de como ver o conteúdo de forma mais explícita se precisar
  // if (infoMap.size > 0) {
  //   console.log(
  //     'Conteúdo do infoMap como objeto:',
  //     Object.fromEntries(infoMap)
  //   );
  // }

  //função para limitar a quantidade até o saldo livre
  const getClampedQuantity = (
    material: IMaterialWithdrawalItemAddForm,
    newQuantity: number
  ): number => {
    const isfreeBalanceDefined =
      typeof material.freeBalanceQuantity === 'number' &&
      !isNaN(material.freeBalanceQuantity);

    let quantity = Math.max(0, newQuantity);

    if (isfreeBalanceDefined) {
      quantity = Math.min(Number(material.freeBalanceQuantity), quantity);
    }

    return quantity;
  };

  const handleQuantityChange = (key: number, change: number) => {
    const material = materialsMap.get(key);
    if (material) {
      const newQuantity = Number(material.quantityWithdrawn) + change;
      onUpdateQuantity(key, getClampedQuantity(material, newQuantity));
    }
  };

  const handleManualQuantityChange = (key: number, value: string) => {
    const material = materialsMap.get(key);
    if (!material) return;

    if (value === '') {
      onUpdateQuantity(key, 0);
      return;
    }

    // Para permitir decimais, trocamos parseInt por parseFloat.
    // Também substituímos a vírgula pelo ponto para garantir a conversão correta.
    const newQuantity = parseFloat(value.replace(',', '.'));
    if (!isNaN(newQuantity)) {
      onUpdateQuantity(key, getClampedQuantity(material, newQuantity));
    }
  };

  if (materials.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        {readOnly
          ? 'No materials for this request.'
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
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Código
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Nome
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Unidade
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                R$ Unitário
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                Estoque
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                Saldo livre
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                Retirar
              </th>
              {/* {!hideMaterialRequestItemId && (
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                  Material Request Item ID
                </th>
              )} */}
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

              console.log(`key: ${material.key}`);
              console.log(infoMap);

              // Campo NÃO vinculado ao estado: vem do `infoMap`

              const isFreeBalanceDefined =
                typeof info?.freeBalanceQuantity === 'number' &&
                !isNaN(info?.freeBalanceQuantity);

              const isphysicalOnHandQuantityDefined =
                typeof info?.physicalOnHandQuantity === 'number' &&
                !isNaN(info?.physicalOnHandQuantity);

              return (
                <tr key={material.key} className='hover:bg-gray-50'>
                  <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                    {material.globalMaterialId}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {info?.name}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {info?.unitOfMeasure}
                  </td>
                  <td className='px-4 py-3 text-right text-sm text-gray-900'>
                    {material.unitPrice?.toString ? (
                      Number(material.unitPrice).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                    ) : (
                      <Badge variant='outline'>Indefinido</Badge>
                    )}
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    {isphysicalOnHandQuantityDefined ? (
                      <Badge
                        variant={
                          Number(info?.freeBalanceQuantity) > 50
                            ? 'default'
                            : Number(info?.freeBalanceQuantity) > 10
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {Number(info?.physicalOnHandQuantity)}
                      </Badge>
                    ) : (
                      <Badge variant='outline'>Indefinido</Badge>
                    )}
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    {isFreeBalanceDefined ? (
                      <Badge
                        variant={
                          Number(info?.freeBalanceQuantity) > 50
                            ? 'default'
                            : Number(info?.freeBalanceQuantity) > 10
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {Number(info?.freeBalanceQuantity)}
                      </Badge>
                    ) : (
                      <Badge variant='outline'>Indefinido</Badge>
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {readOnly ? (
                      <p className='text-gray-900'>
                        {Number(material.quantityWithdrawn)}
                      </p>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleQuantityChange(material.key, -1)}
                          disabled={Number(material.quantityWithdrawn) <= 0}
                        >
                          <Minus className='h-3 w-3' />
                        </Button>
                        <Input
                          type='number'
                          step='any'
                          value={String(material.quantityWithdrawn)}
                          onChange={(e) =>
                            handleManualQuantityChange(
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
                          onClick={() => handleQuantityChange(material.key, 1)}
                          disabled={
                            isFreeBalanceDefined &&
                            Number(material.quantityWithdrawn) >=
                              Number(material.freeBalanceQuantity)
                          }
                        >
                          <Plus className='h-3 w-3' />
                        </Button>
                      </div>
                    )}
                  </td>
                  {/* {!hideMaterialRequestItemId && (
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {material.materialRequestItemId}
                    </td>
                  )} */}
                  {!readOnly && (
                    <td className='px-4 py-3'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => onRemove(material.key)}
                        className='text-red-600 hover:text-red-700'
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
