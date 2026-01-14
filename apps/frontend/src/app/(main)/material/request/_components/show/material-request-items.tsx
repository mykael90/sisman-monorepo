// components/tabs/material-request-items-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { IMaterialRequestShowWithRelations } from '@/app/(main)/material/request/material-request-types';

interface Props {
  items: IMaterialRequestShowWithRelations['items'];
}

export function MaterialRequestItemsTable({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <CardContent className='text-muted-foreground py-8 text-center'>
        Nenhum item cadastrado nesta requisição.
      </CardContent>
    );
  }

  const totalRequestValue = items.reduce(
    (sum, item) =>
      sum + Number(item.quantityRequested) * Number(item.unitPrice || 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens da Requisição</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader className='bg-gray-100'>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Qtd Solicitada</TableHead>
                <TableHead>Qtd Aprovada</TableHead>
                <TableHead>Qtd Entregue</TableHead>
                <TableHead>Qtd Retornada</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Total do Item</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const itemTotal =
                  Number(item.quantityRequested) * Number(item.unitPrice);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className='font-medium'>
                        {item.requestedGlobalMaterial?.name}
                      </div>
                      <div className='text-muted-foreground line-clamp-2 text-xs'>
                        {item.requestedGlobalMaterial?.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.requestedGlobalMaterial?.id || '-'}
                    </TableCell>
                    <TableCell>
                      {item.requestedGlobalMaterial?.unitOfMeasure || '-'}
                    </TableCell>
                    <TableCell>
                      {Number(item.quantityRequested).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {Number(item.quantityApproved).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {Number(item.quantityDelivered).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {Number(item.quantityReturned).toLocaleString()}
                    </TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className='font-medium'>
                      {formatCurrency(itemTotal)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter className='bg-gray-50'>
              <TableRow>
                <TableCell colSpan={8} className='text-right font-bold'>
                  Total Geral:
                </TableCell>
                <TableCell className='text-primary font-bold'>
                  {formatCurrency(totalRequestValue)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
