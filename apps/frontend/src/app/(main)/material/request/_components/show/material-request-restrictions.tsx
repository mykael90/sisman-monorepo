import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { statusMaterialRestrictionDisplayMap } from '@/mappers/material-restriction-mappers-translate';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';

interface Props {
  restrictionOrder: IMaterialRequestShowWithRelations['restrictionOrders'];
}

export function MaterialRequestRestrictions({ restrictionOrder }: Props) {
  if (!restrictionOrder) {
    return (
      <Card>
        <CardContent className='text-muted-foreground py-8 text-center'>
          Nenhuma restrição registrada para esta requisição.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='bg-gray-50 py-3'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <CardTitle className='text-sm'>
              Ordem de Restrição: {restrictionOrder.restrictionOrderNumber}
            </CardTitle>
            <p className='text-sm text-gray-500'>
              Processada em: {formatDate(restrictionOrder.processedAt)}
            </p>
          </div>
          <Badge
            variant={
              restrictionOrder.status === 'FREE' ? 'default' : 'secondary'
            }
          >
            Restrição{' '}
            {restrictionOrder.status
              ? statusMaterialRestrictionDisplayMap[restrictionOrder.status]
              : restrictionOrder.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='p-4'>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
          <div>
            <p className='text-xs font-medium text-gray-500'>Depósito</p>
            <p className='font-medium'>
              {restrictionOrder.warehouse?.name ||
                `Depósito ${restrictionOrder.warehouseId}`}
            </p>
          </div>
          {/* Outros campos info... */}
        </div>

        {restrictionOrder.items && restrictionOrder.items.length > 0 && (
          <div className='mt-4 border-t pt-4'>
            <p className='mb-2 text-sm font-medium'>
              Itens Restritos ({restrictionOrder.items.length})
            </p>
            <div className='rounded-md border'>
              <Table className='text-xs'>
                <TableHeader className='bg-gray-100'>
                  <TableRow>
                    <TableHead>Código Material</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Quantidade Restrita</TableHead>
                    <TableHead>Item da Requisição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restrictionOrder.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.globalMaterialId || 'N/A'}</TableCell>
                      <TableCell>
                        {item.globalMaterial?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {item.globalMaterial?.unitOfMeasure || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {Number(item.quantityRestricted || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ID: {item.targetMaterialRequestItemId}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {restrictionOrder.notes && (
          <div className='mt-4 border-t pt-4'>
            <p className='text-xs font-medium text-gray-500'>Observações</p>
            <p className='text-muted-foreground text-sm'>
              {restrictionOrder.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
