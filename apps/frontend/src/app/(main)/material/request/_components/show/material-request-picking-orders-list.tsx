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
import { formatCurrency, formatDate } from '@/lib/utils';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';

interface Props {
  pickingOrders: IMaterialRequestShowWithRelations['materialPickingOrders'];
}

export function MaterialRequestPickingOrdersList({ pickingOrders }: Props) {
  if (!pickingOrders || pickingOrders.length === 0) {
    return (
      <Card>
        <CardContent className='text-muted-foreground py-8 text-center'>
          Nenhuma ordem de reserva registrada para esta requisição.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {pickingOrders.map((order) => (
        <Card key={order.id} className='overflow-hidden'>
          <CardHeader className='bg-gray-50 py-3'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <CardTitle className='text-sm'>
                  Ordem de Coleta: {order.pickingOrderNumber}
                </CardTitle>
                <p className='text-sm text-gray-500'>
                  Solicitada em: {formatDate(order.requestedAt)}
                </p>
              </div>
              <Badge
                variant={
                  order.status === 'FULLY_WITHDRAWN'
                    ? 'default'
                    : order.status === 'PENDING_PREPARATION'
                      ? 'secondary'
                      : 'outline'
                }
              >
                {order.status === 'FULLY_WITHDRAWN'
                  ? 'Totalmente Retirada'
                  : order.status === 'PENDING_PREPARATION'
                    ? 'Pendente'
                    : order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-4'>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
              <div>
                <p className='text-xs font-medium text-gray-500'>
                  Depósito Transitório
                </p>
                <p className='font-medium'>
                  {order.warehouse?.name || `Depósito ${order.warehouseId}`}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500'>
                  Solicitado por
                </p>
                <p className='font-medium'>
                  {order.requestedByUser?.name ||
                    order.requestedByUser?.login ||
                    `Usuário ${order.requestedByUserId}`}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500'>Valor Total</p>
                <p className='font-medium'>
                  {formatCurrency(order.valuePickingOrder)}
                </p>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className='mt-4 border-t pt-4'>
                <p className='mb-2 text-sm font-medium'>
                  Itens da Ordem de Reserva ({order.items.length})
                </p>
                <div className='rounded-md border'>
                  <Table className='text-xs'>
                    <TableHeader className='bg-gray-100'>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Qtd Solicitada</TableHead>
                        <TableHead>Qtd Separada</TableHead>
                        <TableHead>Qtd Retirada</TableHead>
                        <TableHead>Valor Unitário</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.globalMaterialId || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {item.globalMaterial?.name || 'Não identificado'}
                          </TableCell>
                          <TableCell>
                            {Number(item.quantityToPick).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {Number(item.quantityPicked).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {Number(item.quantityWithdrawn).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {order.notes && (
              <div className='mt-4 border-t pt-4'>
                <p className='text-xs font-medium text-gray-500'>Observações</p>
                <p className='text-muted-foreground text-sm'>{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
