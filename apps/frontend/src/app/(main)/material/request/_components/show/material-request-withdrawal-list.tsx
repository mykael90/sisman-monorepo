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
  withdrawals: IMaterialRequestShowWithRelations['materialWithdrawals'];
}

export function MaterialRequestWithdrawalsList({ withdrawals }: Props) {
  if (!withdrawals || withdrawals.length === 0) {
    return (
      <Card>
        <CardContent className='text-muted-foreground py-8 text-center'>
          Nenhuma saída registrada para esta requisição.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {withdrawals.map((withdrawal) => (
        <Card key={withdrawal.id} className='overflow-hidden'>
          <CardHeader className='bg-gray-50 py-3'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <CardTitle className='text-sm'>
                  Saída: {withdrawal.withdrawalNumber}
                </CardTitle>
                <p className='text-sm text-gray-500'>
                  Data: {formatDate(withdrawal.withdrawalDate)}
                </p>
              </div>
              <Badge variant='default'>Saída Realizada</Badge>
            </div>
          </CardHeader>
          <CardContent className='p-4'>
            {/* Grid Info Simplificado para brevidade */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
              <div>
                <p className='text-xs font-medium text-gray-500'>Valor Total</p>
                <p className='font-medium'>
                  {formatCurrency(withdrawal.valueWithdrawal)}
                </p>
              </div>
              {/* ... Outros campos (Depósito, Processado por, Coletado por) ... */}
            </div>

            {withdrawal.items && withdrawal.items.length > 0 && (
              <div className='mt-4 border-t pt-4'>
                <p className='mb-2 text-sm font-medium'>
                  Itens Retirados ({withdrawal.items.length})
                </p>
                <div className='rounded-md border'>
                  <Table className='text-xs'>
                    <TableHeader className='bg-gray-100'>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor Unitário</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawal.items.map((item) => {
                        const total =
                          Number(item.quantityWithdrawn) *
                          Number(item.unitPrice);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.globalMaterialId || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {item.globalMaterial?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {Number(item.quantityWithdrawn).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className='font-medium'>
                              {formatCurrency(total)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            {withdrawal.notes && (
              <div className='mt-4 border-t pt-4'>
                <p className='text-xs font-medium text-gray-500'>Observações</p>
                <p className='text-muted-foreground text-sm'>
                  {withdrawal.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
