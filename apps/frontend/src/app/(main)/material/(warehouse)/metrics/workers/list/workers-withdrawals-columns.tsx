import {
  ColumnDef,
  createColumnHelper,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  FileText,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  ChartBar,
  ChartArea
} from 'lucide-react';
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears
} from 'date-fns';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { IWorkerWithdrawals } from '@/app/(main)/worker/worker-types';

const columnHelper = createColumnHelper<IWorkerWithdrawals>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IWorkerWithdrawals> => ({
  onViewDetails: (row: Row<IWorkerWithdrawals>) => {
    console.log('View worker withdrawals details', row.original);
    // TODO: Implementar navegação para uma página de detalhes de retiradas do trabalhador.
  }
});

export const defaultColumn: Partial<ColumnDef<IWorkerWithdrawals>> = {
  enableResizing: true,
  enableColumnFilter: false,
  filterFn: 'arrIncludesSome'
};

export const columns = (
  configuredActions: ActionHandlers<IWorkerWithdrawals>
): ColumnDef<IWorkerWithdrawals, any>[] => [
  columnHelper.display({
    id: 'expander',
    size: 30,
    header: ({ table }) => (
      <Button
        variant='ghost'
        size='icon'
        onClick={table.getToggleAllRowsExpandedHandler()}
      >
        {table.getIsAllRowsExpanded() ? (
          <ChevronDown className='h-4 w-4' />
        ) : (
          <ChevronRight className='h-4 w-4' />
        )}
      </Button>
    ),
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='icon'
        onClick={(e) => {
          e.stopPropagation();
          row.toggleExpanded();
        }}
      >
        {row.getIsExpanded() ? (
          <ChevronDown className='h-4 w-4' />
        ) : (
          <ChevronRight className='h-4 w-4' />
        )}
      </Button>
    )
  }),
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => {
      return <div>Nome do Trabalhador</div>;
    },
    cell: (props) => props.getValue(),
    size: 300
  }),
  columnHelper.accessor(
    (row) => row.workerContracts[0]?.workerSpecialty?.name,
    {
      id: 'workerSpecialty',
      header: ({ column }) => {
        return <div>Especialidade</div>;
      },
      cell: (props) => props.getValue() || 'N/A',
      enableColumnFilter: true,
      size: 200
    }
  ),
  columnHelper.accessor(
    (row) => {
      const latestContract = row.workerContracts[0];
      if (latestContract?.startDate) {
        const start = new Date(latestContract.startDate);
        const end = latestContract.endDate
          ? new Date(latestContract.endDate)
          : new Date();

        const years = differenceInYears(end, start);
        const months = differenceInMonths(end, start) % 12;
        const days = differenceInDays(end, start);

        let duration = '';
        if (years > 0) duration += `${years} ano(s) `;
        if (months > 0) duration += `${months} mês(es) `;
        if (days > 0) duration += `${days} dia(s)`;

        return duration.trim() || 'Menos de um dia';
      }
      return 'N/A';
    },
    {
      id: 'contractDuration',
      header: ({ column }) => {
        return <div>Tempo de Contrato</div>;
      },
      cell: (props) => props.getValue(),
      size: 200
    }
  ),
  columnHelper.accessor('withdrawalsCollected', {
    id: 'totalWithdrawals',
    header: ({ column }) => {
      return (
        <div
          className='flex cursor-pointer items-center text-center'
          onClick={() => column.toggleSorting()}
        >
          Retiradas
          <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
        </div>
      );
    },
    cell: (props) => (
      <div className='w-full text-center'>{props.getValue()?.length || 0}</div>
    ),
    size: 30,
    enableResizing: false,
    enableColumnFilter: false,
    footer: ({ table }) => {
      const total = table
        .getFilteredRowModel()
        .rows.reduce(
          (sum, row) => sum + (row.original.withdrawalsCollected?.length || 0),
          0
        );
      return <div className='text-center font-bold'>{total || '0'}</div>;
    }
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className='flex gap-2'>
        {/* <Button
          title='Ver detalhes das retiradas do trabalhador'
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onViewDetails(row)}
        >
          <FileText className='h-4 w-4' />
        </Button> */}
      </div>
    )
  })
];

export const SubRowComponent = ({ row }: { row: Row<IWorkerWithdrawals> }) => {
  const withdrawals = row.original.withdrawalsCollected || [];

  return (
    <div className='p-2 pl-8'>
      <h4 className='mb-2 text-sm font-semibold'>Detalhes das Retiradas:</h4>
      {withdrawals.length > 0 ? (
        withdrawals.map((withdrawal, opIndex) => (
          <div key={withdrawal.id} className='mb-4 rounded-md border p-4'>
            <p>
              <strong>Número da Retirada:</strong> {withdrawal.withdrawalNumber}
            </p>
            <p>
              <strong>Data da Retirada:</strong>{' '}
              {new Date(withdrawal.withdrawalDate).toLocaleString()}
            </p>
            <p>
              <strong>Valor da Retirada:</strong> R${' '}
              {parseFloat(
                withdrawal.valueWithdrawal?.toString() || '0'
              ).toFixed(2)}
            </p>
            <h5 className='mt-2 text-sm font-medium'>Itens:</h5>
            {withdrawal.items && withdrawal.items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className='text-center'>Quantidade</TableHead>
                    <TableHead className='text-center'>
                      Preço Unitário
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawal.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.globalMaterial?.name}</TableCell>
                      <TableCell className='text-center'>
                        {item.quantityWithdrawn?.toString()}{' '}
                        {item.globalMaterial?.unitOfMeasure}
                      </TableCell>
                      <TableCell className='text-center'>
                        R${' '}
                        {parseFloat(item.unitPrice?.toString() || '0').toFixed(
                          2
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum item nesta retirada.</p>
            )}
          </div>
        ))
      ) : (
        <p>Nenhuma retirada encontrada para este trabalhador.</p>
      )}
    </div>
  );
};
