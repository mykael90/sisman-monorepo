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
  receipts: IMaterialRequestShowWithRelations['materialReceipts'];
}

export function MaterialRequestReceiptsList({ receipts }: Props) {
  if (!receipts || receipts.length === 0) {
    return (
      <Card>
        <CardContent className='text-muted-foreground py-8 text-center'>
          Nenhuma entrada registrada para esta requisição.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {receipts.map((receipt) => (
        <Card key={receipt.id} className='overflow-hidden'>
          <CardHeader className='bg-gray-50 py-3'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <CardTitle className='text-sm'>
                  Recebimento: {receipt.receiptNumber}
                </CardTitle>
                <p className='text-sm text-gray-500'>
                  Data: {formatDate(receipt.receiptDate)}
                </p>
              </div>
              <Badge
                variant={
                  receipt.status === 'FULLY_ACCEPTED' ? 'default' : 'secondary'
                }
              >
                {receipt.status === 'FULLY_ACCEPTED'
                  ? 'Totalmente Aceito'
                  : receipt.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='p-4'>
            {/* Informações do Header do Card */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div>
                <p className='text-xs font-medium text-gray-500'>
                  Depósito Destino
                </p>
                <p className='font-medium'>
                  {receipt.destinationWarehouse?.name ||
                    `Depósito ${receipt.destinationWarehouseId}`}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500'>
                  Tipo de Movimento
                </p>
                <p className='font-medium'>
                  {receipt.movementType?.name ||
                    `Tipo ${receipt.movementTypeId}`}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500'>
                  Processado por
                </p>
                <p className='font-medium'>
                  {receipt.processedByUser?.name ||
                    receipt.processedByUser?.login ||
                    `Usuário ${receipt.processedByUserId}`}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-gray-500'>Valor Total</p>
                <p className='font-medium'>
                  {formatCurrency(receipt.valueReceipt)}
                </p>
              </div>
            </div>

            {/* Tabela de Itens Aninhada */}
            {receipt.items && receipt.items.length > 0 && (
              <div className='mt-4 border-t pt-4'>
                <p className='mb-2 text-sm font-medium'>
                  Itens Recebidos ({receipt.items.length})
                </p>
                <div className='rounded-md border'>
                  <Table className='text-xs'>
                    <TableHeader className='bg-gray-100'>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Qtd Esperada</TableHead>
                        <TableHead>Qtd Recebida</TableHead>
                        <TableHead>Qtd Rejeitada</TableHead>
                        <TableHead>Valor Unitário</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipt.items.map((item) => {
                        const itemTotal =
                          Number(item.quantityReceived) *
                          Number(item.unitPrice);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{item.materialId || 'N/A'}</TableCell>
                            <TableCell>
                              {item.material?.name || 'Não identificado'}
                            </TableCell>
                            <TableCell>
                              {Number(item.quantityExpected).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {Number(item.quantityReceived).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {Number(item.quantityRejected).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className='font-medium'>
                              {formatCurrency(itemTotal)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {receipt.notes && (
              <div className='mt-4 border-t pt-4'>
                <p className='text-xs font-medium text-gray-500'>Observações</p>
                <p className='text-muted-foreground text-sm'>{receipt.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
