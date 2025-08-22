'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Minus, Plus, Info } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';
import { IMaterialWithdrawalItemAddForm } from '../../withdrawal-types';
import { IItemMaterialRequestBalance } from '../../../../request/material-request-types';

export type IMaterialWithdrawalItemMatRequestAddForm =
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

interface TableFormItemsMaterialRequestProps {
  materials: IMaterialWithdrawalItemMatRequestAddForm[];
  onRemove: (key: number) => void;
  onUpdateQuantity: (key: number, quantity: number) => void;
  hideMaterialRequestItemId?: boolean;
  readOnly?: boolean;
}

export function TableFormItemsMaterialRequest({
  materials,
  onRemove,
  onUpdateQuantity,
  readOnly = false
}: TableFormItemsMaterialRequestProps) {
  // Função para limitar a quantidade até o saldo potencial livre
  const getClampedQuantity = (
    material: IMaterialWithdrawalItemMatRequestAddForm,
    newQuantity: number
  ): number => {
    const freeBalancePotential = Number(material.quantityFreeBalancePotential);
    const isFreeBalanceDefined = !isNaN(freeBalancePotential);
    let quantity = Math.max(0, newQuantity);

    if (isFreeBalanceDefined) {
      quantity = Math.min(freeBalancePotential, quantity);
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
                Nome
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Unidade
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                Solicitado
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-min'>Saldo Efetivo</div>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      {/* AJUSTE: Adicionado flex-shrink-0 para manter o tamanho do ícone */}
                      <Info className='h-4 w-4 flex-shrink-0 cursor-pointer text-gray-500' />
                    </HoverCardTrigger>
                    <HoverCardContent className='w-80 text-sm'>
                      <div className='space-y-1'>
                        <p className='font-bold'>Cálculo do Saldo Efetivo</p>
                        <p className='italic'>
                          Representa o saldo físico disponível (livre) agora.
                        </p>
                        <hr className='my-2' />
                        <p className='pl-2 text-green-700'>+ Qtd. Recebida</p>
                        <p className='pl-2 text-red-700'>- Qtd. Retirada</p>
                        <p className='pl-2 text-red-700'>- Qtd. Reservada</p>
                        <p className='pl-2 text-red-700'>- Qtd. Restrita</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-min'>Saldo Potencial</div>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      {/* AJUSTE: Adicionado flex-shrink-0 para manter o tamanho do ícone */}
                      <Info className='h-4 w-4 flex-shrink-0 cursor-pointer text-gray-500' />
                    </HoverCardTrigger>
                    <HoverCardContent className='w-80 text-sm'>
                      <div className='space-y-1'>
                        <p className='font-bold'>Cálculo do Saldo Potencial</p>
                        <p className='italic'>
                          É o saldo que estará disponível para retirada nesta
                          solicitação. Considera a quantidade solicitada.
                        </p>
                        <hr className='my-2' />
                        <p className='pl-2 text-green-700'>+ Qtd. Solicitada</p>
                        <p className='pl-2 text-red-700'>- Qtd. Retirada</p>
                        <p className='pl-2 text-red-700'>- Qtd. Reservada</p>
                        <p className='pl-2 text-red-700'>- Qtd. Restrita</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </th>
              <th className='px-4 py-3 text-center text-sm font-medium text-gray-900'>
                Retirar
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
              const freeBalanceEffective = Number(
                material.quantityFreeBalanceEffective
              );
              const isFreeBalanceEffectiveDefined =
                !isNaN(freeBalanceEffective);

              const freeBalancePotential = Number(
                material.quantityFreeBalancePotential
              );
              const isFreeBalanceDefined = !isNaN(freeBalancePotential);

              return (
                <tr key={material.key} className='hover:bg-gray-50'>
                  <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                    {material.globalMaterialId}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    <div className='flex items-center gap-2'>
                      <span>{material.name}</span>
                      {material.description && (
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className='h-4 w-4 flex-shrink-0 cursor-pointer text-gray-500' />
                          </HoverCardTrigger>
                          <HoverCardContent className='w-xl text-sm'>
                            <p className='font-bold'>Descrição do material</p>
                            <hr className='my-2' />
                            <p className='pl-2'>{material.description}</p>
                          </HoverCardContent>
                        </HoverCard>
                      )}
                    </div>
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-900'>
                    {material.unitOfMeasure}
                  </td>
                  {/* AJUSTE: Adicionado HoverCard com detalhes na coluna Solicitado */}
                  <td className='px-4 py-3 text-center text-sm'>
                    <div className='flex items-center justify-center gap-2'>
                      <Badge variant='outline'>
                        {Number(material.quantityRequested)}
                      </Badge>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Info className='h-4 w-4 flex-shrink-0 cursor-pointer text-gray-500' />
                        </HoverCardTrigger>
                        <HoverCardContent className='w-64 text-sm'>
                          <div className='space-y-1 font-medium'>
                            <p className='font-bold'>Detalhes da Requisição</p>
                            <hr className='my-2' />
                            <div className='flex justify-between'>
                              <span>Recebido:</span>
                              <span>
                                {Number(material.quantityReceivedSum)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span>Retirado:</span>
                              <span>
                                {Number(material.quantityWithdrawnSum)}
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span>Reservado:</span>
                              <span>{Number(material.quantityReserved)}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span>Restrito:</span>
                              <span>{Number(material.quantityRestricted)}</span>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-center text-sm'>
                    {isFreeBalanceEffectiveDefined ? (
                      <Badge
                        variant={
                          freeBalanceEffective > 50
                            ? 'default'
                            : freeBalanceEffective > 10
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {freeBalanceEffective}
                      </Badge>
                    ) : (
                      <Badge variant='outline'>Indefinido</Badge>
                    )}
                  </td>
                  <td className='px-4 py-3 text-center text-sm'>
                    {isFreeBalanceDefined ? (
                      <Badge
                        variant={
                          freeBalancePotential > 50
                            ? 'default'
                            : freeBalancePotential > 10
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {freeBalancePotential}
                      </Badge>
                    ) : (
                      <Badge variant='outline'>Indefinido</Badge>
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {readOnly ? (
                      <p className='text-center text-gray-900'>
                        {Number(material.quantityWithdrawn)}
                      </p>
                    ) : (
                      <div className='flex items-center justify-center gap-2'>
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
                              freeBalancePotential
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
