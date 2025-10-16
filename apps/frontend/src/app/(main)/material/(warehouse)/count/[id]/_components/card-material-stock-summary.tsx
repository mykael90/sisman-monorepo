'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '../../../../../../../components/ui/badge';
import { IWarehouseStockWithRelations } from '../../../warehouse-stock/warehouse-stock-types';

export function CardMaterialStockSummary({
  materialStock
}: {
  materialStock: IWarehouseStockWithRelations;
}) {
  console.log(materialStock);
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Informações do Material</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid grid-cols-1'>
          <div className='space-y-2'>
            <Label>Material</Label>
            <div>
              <Badge
                variant='outline'
                className='text-muted-foreground mb-0.5 text-xs'
              >
                {materialStock.material.id}
              </Badge>
              <p className='text-muted-foreground'>
                {materialStock.material.name}
              </p>
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1'>
          <div className='space-y-2'>
            <Label>Descrição</Label>
            <p className='text-muted-foreground'>
              {materialStock.material.description}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
          <div className='space-y-2'>
            <Label>Almoxarifado</Label>
            <p className='text-muted-foreground'>
              {materialStock.warehouse.name}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>Última Contagem</Label>
            <p className='text-muted-foreground'>
              {materialStock.lastStockCountDate
                ? new Date(
                    materialStock.lastStockCountDate
                  ).toLocaleDateString()
                : 'Nenhuma contagem realizada'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>Quantidade Inicial</Label>
            <p className='text-muted-foreground'>
              {materialStock.initialStockQuantity
                ? Number(materialStock.initialStockQuantity).toLocaleString(
                    'pt-BR',
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    }
                  )
                : 'N/A'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>Saldo</Label>
            <p className='text-muted-foreground'>
              {materialStock.physicalOnHandQuantity
                ? Number(materialStock.physicalOnHandQuantity).toLocaleString(
                    'pt-BR',
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    }
                  )
                : 'N/A'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label>Saldo Livre</Label>
            <p className='text-muted-foreground'>
              {materialStock.freeBalanceQuantity
                ? Number(materialStock.freeBalanceQuantity).toLocaleString(
                    'pt-BR',
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    }
                  )
                : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
