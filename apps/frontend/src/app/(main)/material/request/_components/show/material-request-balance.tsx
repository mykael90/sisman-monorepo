// components/material-request-balance-table.tsx
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
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { IMaterialRequestBalanceWithRelations } from '@/app/(main)/material/request/material-request-types';

interface Props {
  data: IMaterialRequestBalanceWithRelations;
}

export function MaterialRequestBalanceTable({ data }: Props) {
  if (!data.itemsBalance || data.itemsBalance.length === 0) return null;

  // Cálculos auxiliares podem ficar aqui ou em um utilitário
  const totals = data.itemsBalance.reduce(
    (acc, item) => ({
      requested: acc.requested + Number(item.quantityRequested),
      approved: acc.approved + Number(item.quantityApproved),
      received: acc.received + Number(item.quantityReceivedSum),
      withdrawn: acc.withdrawn + Number(item.quantityWithdrawnSum),
      reserved: acc.reserved + Number(item.quantityReserved),
      restricted: acc.restricted + Number(item.quantityRestricted),
      freeEffective:
        acc.freeEffective + Number(item.quantityFreeBalanceEffective),
      freePotential:
        acc.freePotential + Number(item.quantityFreeBalancePotential),
      potential: acc.potential + Number(item.quantityBalancePotential),
      totalValue:
        acc.totalValue + Number(item.quantityRequested) * Number(item.unitPrice)
    }),
    {
      requested: 0,
      approved: 0,
      received: 0,
      withdrawn: 0,
      reserved: 0,
      restricted: 0,
      freeEffective: 0,
      freePotential: 0,
      potential: 0,
      totalValue: 0
    }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BarChart3 className='h-5 w-5' />
          Balanço da Requisição de Material
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader className='bg-gray-100'>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Qtd Solicitada</TableHead>
                <TableHead>Qtd Aprovada</TableHead>
                <TableHead>Qtd Recebida</TableHead>
                <TableHead>Qtd Retirada</TableHead>
                <TableHead>Qtd Reservada</TableHead>
                <TableHead>Qtd Restrita</TableHead>
                <TableHead>Saldo Livre Efetivo</TableHead>
                <TableHead>Saldo Livre Potencial</TableHead>
                <TableHead>Saldo Potencial</TableHead>
                <TableHead>Valor Unitário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.itemsBalance.map((item) => (
                <TableRow key={item.globalMaterialId}>
                  <TableCell>
                    <div className='font-medium'>{item.name}</div>
                    {item.description && (
                      <div className='text-muted-foreground mt-1 line-clamp-1 text-xs'>
                        {item.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{item.unitOfMeasure}</TableCell>
                  <TableCell>
                    {Number(item.quantityRequested).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {Number(item.quantityApproved).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {Number(item.quantityReceivedSum).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {Number(item.quantityWithdrawnSum).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {Number(item.quantityReserved).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {Number(item.quantityRestricted).toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={
                      Number(item.quantityFreeBalanceEffective) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {Number(item.quantityFreeBalanceEffective).toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={
                      Number(item.quantityFreeBalancePotential) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {Number(item.quantityFreeBalancePotential).toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={
                      Number(item.quantityBalancePotential) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {Number(item.quantityBalancePotential).toLocaleString()}
                  </TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className='bg-gray-50 font-medium'>
              <TableRow>
                <TableCell colSpan={2} className='text-right'>
                  Totais:
                </TableCell>
                <TableCell>{totals.requested.toLocaleString()}</TableCell>
                <TableCell>{totals.approved.toLocaleString()}</TableCell>
                <TableCell>{totals.received.toLocaleString()}</TableCell>
                <TableCell>{totals.withdrawn.toLocaleString()}</TableCell>
                <TableCell>{totals.reserved.toLocaleString()}</TableCell>
                <TableCell>{totals.restricted.toLocaleString()}</TableCell>
                <TableCell>{totals.freeEffective.toLocaleString()}</TableCell>
                <TableCell>{totals.freePotential.toLocaleString()}</TableCell>
                <TableCell>{totals.potential.toLocaleString()}</TableCell>
                <TableCell>{formatCurrency(totals.totalValue)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        {/* Legenda mantida simples */}
        <div className='mt-4 text-sm text-gray-600'>
          {/* ... conteúdo da legenda ... */}
        </div>
      </CardContent>
    </Card>
  );
}
