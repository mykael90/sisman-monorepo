'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Minus, Plus } from 'lucide-react';
import { IMaterialWithdrawalItemAddForm } from './withdrawal-base-form-add';

interface MaterialTableProps {
  materials: IMaterialWithdrawalItemAddForm[];
  onRemove: (key: number) => void;
  onUpdateQuantity: (key: number, quantity: number) => void;
  hideMaterialRequestItemId?: boolean;
  readOnly?: boolean;
}

export function ItemsTableFormArray({
  materials,
  onRemove,
  onUpdateQuantity,
  hideMaterialRequestItemId,
  readOnly = false
}: MaterialTableProps) {
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
      quantity = Math.min(material.freeBalanceQuantity, quantity);
    }

    return quantity;
  };

  const handleQuantityChange = (key: number, change: number) => {
    const material = materials.find((m) => m.key === key);
    if (material) {
      const newQuantity = Number(material.quantityWithdrawn) + change;
      onUpdateQuantity(key, getClampedQuantity(material, newQuantity));
    }
  };

  const handleManualQuantityChange = (key: number, value: string) => {
    const material = materials.find((m) => m.key === key);
    if (!material) return;

    if (value === '') {
      onUpdateQuantity(key, 0);
      return;
    }

    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity)) {
      onUpdateQuantity(key, getClampedQuantity(material, newQuantity));
    }
  };

  if (materials.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        {readOnly
          ? 'No materials for this request.'
          : 'Nenhum material adicionado, utilize o botão para adicionar.'}
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
                Descrição
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Unidade
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
              const isFreeBalanceDefined =
                typeof material.freeBalanceQuantity === 'number' &&
                !isNaN(material.freeBalanceQuantity);

              const isphysicalOnHandQuantityDefined =
                typeof material.physicalOnHandQuantity === 'number' &&
                !isNaN(material.physicalOnHandQuantity);

              return (
                <tr key={material.key} className='hover:bg-gray-50'>
                  <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                    {material.globalMaterialId}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {material.description}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {material.unitOfMeasure}
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    {isphysicalOnHandQuantityDefined ? (
                      <Badge
                        variant={
                          material.freeBalanceQuantity > 50
                            ? 'default'
                            : material.freeBalanceQuantity > 10
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {material.physicalOnHandQuantity}
                      </Badge>
                    ) : (
                      <Badge variant='outline'>Indefinido</Badge>
                    )}
                  </td>
                  <td className='px-4 py-3 text-sm'>
                    {isFreeBalanceDefined ? (
                      <Badge
                        variant={
                          material.freeBalanceQuantity > 50
                            ? 'default'
                            : material.freeBalanceQuantity > 10
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {material.freeBalanceQuantity}
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
                          type='tel'
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
                              material.freeBalanceQuantity
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
