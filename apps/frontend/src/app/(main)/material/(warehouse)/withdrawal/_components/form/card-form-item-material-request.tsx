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
import { IItemWithdrawalMaterialRequestForm } from '../card-material-link-details';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CardFormItemMaterialRequestProps {
  material: IMaterialWithdrawalItemAddForm;
  info: IItemWithdrawalMaterialRequestForm | undefined;
  onRemove: (key: number) => void;
  onUpdateQuantity: (key: number, quantity: number) => void;
  handleQuantityChange: (key: number, change: number) => void;
  handleManualQuantityChange: (key: number, value: string) => void;
  readOnly?: boolean;
}

export function CardFormItemMaterialRequest({
  material,
  info,
  onRemove,
  onUpdateQuantity,
  handleQuantityChange,
  handleManualQuantityChange,
  readOnly = false
}: CardFormItemMaterialRequestProps) {
  const freeBalanceEffective = Number(info?.quantityFreeBalanceEffective);
  const isFreeBalanceEffectiveDefined = !isNaN(freeBalanceEffective);

  const freeBalancePotential = Number(info?.quantityFreeBalancePotential);
  const isFreeBalanceDefined = !isNaN(freeBalancePotential);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex justify-between'>
          <span>{info?.name}</span>
          {!readOnly && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onRemove(material.key)}
              className='text-red-600 hover:text-red-700'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='grid gap-4'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground'>Código:</span>
          <span className='font-medium'>{info?.globalMaterialId}</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground'>Unidade:</span>
          <span className='font-medium'>{info?.unitOfMeasure}</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground'>Solicitado:</span>
          <Badge variant='outline'>{Number(info?.quantityRequested)}</Badge>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground'>Saldo Efetivo:</span>
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
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground'>Saldo Potencial:</span>
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
        </div>
        <div>
          <span className='text-muted-foreground'>Retirar</span>
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
                type='number'
                step='any'
                value={String(material.quantityWithdrawn)}
                onChange={(e) =>
                  handleManualQuantityChange(material.key, e.target.value)
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
                  Number(material.quantityWithdrawn) >= freeBalancePotential
                }
              >
                <Plus className='h-3 w-3' />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
