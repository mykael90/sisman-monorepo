'use client';

import { Badge } from '@/components/ui/badge';
import { InfoHoverCard } from '../../../../../../components/info-hover-card';
import { formatToBRL } from '../../../../../../lib/utils';
import { IItemMaintenanceRequestBalance } from '../../../../maintenance/request/request-types';

interface MaterialBalanceSummaryTableProps {
  itemsBalance: IItemMaintenanceRequestBalance[];
}

export function MaterialBalanceSummaryTable({
  itemsBalance
}: MaterialBalanceSummaryTableProps) {
  if (!itemsBalance || itemsBalance.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        Nenhum material encontrado para esta requisição.
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
                ID Material Global
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
              <th className='w-32 px-4 py-3 text-center text-sm font-medium text-gray-900'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-min'>Solicitado</div>
                  <InfoHoverCard
                    title='Quantidade Solicitada'
                    subtitle='Soma das quantidades solicitadas para este material.'
                  />
                </div>
              </th>
              <th className='w-32 px-4 py-3 text-center text-sm font-medium text-gray-900'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-min'>Recebido</div>
                  <InfoHoverCard
                    title='Quantidade Recebida'
                    subtitle='Soma das quantidades recebidas para este material.'
                  />
                </div>
              </th>
              <th className='w-32 px-4 py-3 text-center text-sm font-medium text-gray-900'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-min'>Retirado</div>
                  <InfoHoverCard
                    title='Quantidade Retirada'
                    subtitle='Soma das quantidades retiradas para este material.'
                  />
                </div>
              </th>
              <th className='w-32 px-4 py-3 text-center text-sm font-medium text-gray-900'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-min'>Saldo Efetivo</div>
                  <InfoHoverCard
                    title='Saldo Efetivo'
                    subtitle='Balanço real do material (Recebido - Retirado).'
                  />
                </div>
              </th>
              <th className='w-32 px-4 py-3 text-center text-sm font-medium text-gray-900'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-min'>Saldo Potencial</div>
                  <InfoHoverCard
                    title='Saldo Potencial'
                    subtitle='Balanço potencial do material.'
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {itemsBalance.map((item, index) => (
              <tr
                key={item.globalMaterialId + index}
                className='hover:bg-gray-50'
              >
                <td className='w-min px-4 py-3 text-sm font-medium text-gray-900'>
                  {item.globalMaterialId}
                </td>
                <td className='px-4 py-3 text-sm text-gray-900'>
                  <div className='flex items-center justify-start gap-2'>
                    {item.name}
                    <InfoHoverCard
                      title='Descrição do Material'
                      content={item.description}
                      className='w-200'
                    />
                  </div>
                </td>
                <td className='px-4 py-3 text-sm text-gray-900'>
                  {item.unitOfMeasure}
                </td>
                <td className='px-4 py-3 text-right text-sm text-gray-900'>
                  {item.unitPrice ? (
                    <Badge variant={'secondary'}>
                      {formatToBRL(Number(item.unitPrice))}
                    </Badge>
                  ) : (
                    <Badge variant='outline'>Indefinido</Badge>
                  )}
                </td>
                <td className='px-4 py-3 text-right text-sm'>
                  <Badge variant='outline'>{item.quantityRequestedSum}</Badge>
                </td>
                <td className='px-4 py-3 text-right text-sm'>
                  <Badge variant='outline'>{item.quantityReceivedSum}</Badge>
                </td>
                <td className='px-4 py-3 text-right text-sm'>
                  <Badge variant='outline'>{item.quantityWithdrawnSum}</Badge>
                </td>
                <td className='px-4 py-3 text-right text-sm'>
                  <Badge
                    variant={
                      Number(item.effectiveBalance) >= 0
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {item.effectiveBalance}
                  </Badge>
                </td>
                <td className='px-4 py-3 text-right text-sm'>
                  <Badge
                    variant={
                      Number(item.potentialBalance) >= 0
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {item.potentialBalance}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
