'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Minus, Plus } from 'lucide-react';
import { IMaterialWithdrawalItemAddServiceUsage } from './material-withdrawal-form';

interface MaterialTableProps {
  materials: IMaterialWithdrawalItemAddServiceUsage[];
  onRemove: (key: number) => void;
  onUpdateQuantity: (key: number, quantity: number) => void;
  hideMaterialRequestItemId?: boolean;
  readOnly?: boolean;
}

export function MaterialTable({
  materials,
  onRemove,
  onUpdateQuantity,
  hideMaterialRequestItemId,
  readOnly = false // Destructure the prop here, with a default of false
}: MaterialTableProps) {
  const handleQuantityChange = (key: number, change: number) => {
    const material = materials.find((m) => m.key === key);
    if (material) {
      const newQuantity = Math.max(
        0,
        Math.min(material.stockQty, Number(material.quantityWithdrawn) + change)
      );
      onUpdateQuantity(key, newQuantity);
    }
  };

  if (materials.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        {readOnly
          ? 'No materials for this request.'
          : 'No materials added yet. Use the search above to add materials.'}
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
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Stock Qty
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Qty to Remove
              </th>
              {!hideMaterialRequestItemId && (
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                  Material Request Item ID
                </th>
              )}
              {!readOnly && (
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {materials.map((material) => (
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
                  <Badge
                    variant={
                      material.stockQty > 50
                        ? 'default'
                        : material.stockQty > 10
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {material.stockQty}
                  </Badge>
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
                        value={Number(material.quantityWithdrawn)}
                        onChange={(e) =>
                          onUpdateQuantity(
                            material.key,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className='w-16 text-center'
                        min='0'
                        // max={material.stockQty}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleQuantityChange(material.key, 1)}
                        disabled={
                          Number(material.quantityWithdrawn) >=
                          material.stockQty
                        }
                      >
                        <Plus className='h-3 w-3' />
                      </Button>
                    </div>
                  )}
                </td>
                {!hideMaterialRequestItemId && (
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {material.materialRequestItemId}
                  </td>
                )}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
