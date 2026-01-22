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
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome do Trabalhador
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: (props) => props.getValue(),
    size: 300
  }),
  // columnHelper.accessor('cpf', {
  //   id: 'cpf',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant='ghost'
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //       >
  //         CPF
  //         <ArrowUpDown className='ml-2 h-4 w-4' />
  //       </Button>
  //     );
  //   },
  //   cell: (props) => props.getValue(),
  //   size: 150
  // }),
  columnHelper.accessor('withdrawalsCollected', {
    id: 'totalWithdrawals',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Retiradas
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: (props) => props.getValue()?.length || 0,
    size: 100,
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
    header: 'Ações',
    cell: ({ row }) => (
      <div className='flex gap-2'>
        <Button
          title='Ver detalhes das retiradas do trabalhador'
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onViewDetails(row)}
        >
          <FileText className='h-4 w-4' />
        </Button>
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
