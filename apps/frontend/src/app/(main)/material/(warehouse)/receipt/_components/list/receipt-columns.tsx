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
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  IMaterialReceiptWithRelations,
  IMaterialReceiptItem
} from '../../receipt-types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
  materialOperationInDisplayMapPorguguese,
  TMaterialOperationInKey
} from '../../../../../../../mappers/material-operations-mappers-translate';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import { Prosto_One } from 'next/font/google';
import { formatCodigoUnidade } from '../../../../../../../lib/utils';

const columnHelper = createColumnHelper<IMaterialReceiptWithRelations>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IMaterialReceiptWithRelations> => ({
  onEdit: (row: Row<IMaterialReceiptWithRelations>) => {
    console.log('Edit receipt', row.original);
    if (row.original.id) {
      router.push(`receipt/edit/${row.original.id}`);
    } else {
      console.error('Receipt ID is missing, cannot navigate to edit page.');
      throw new Error('Receipt ID is missing, cannot navigate to edit page.');
    }
  },
  onDelete: (row: Row<IMaterialReceiptWithRelations>) => {
    console.log('Delete receipt', row.original);
  }
});

export const columns = (
  configuredActions: ActionHandlers<IMaterialReceiptWithRelations>
): ColumnDef<IMaterialReceiptWithRelations, any>[] => [
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
  columnHelper.accessor(
    (row) => {
      const code = row.movementType?.code;
      if (!code) {
        return 'N/A';
      }
      return (
        materialOperationInDisplayMapPorguguese[
          code as TMaterialOperationInKey
        ] || code
      );
    },
    {
      id: 'movementSubtype',
      header: 'Tipo de Entrada',
      cell: (props) => <span className='capitalize'>{props.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: 'arrIncludesSome'
    }
  ),
  columnHelper.accessor(
    (row) =>
      row.materialRequest?.maintenanceRequest?.protocolNumber ||
      row.materialWithdrawal?.maintenanceRequest?.protocolNumber,
    {
      id: 'protocolNumberRMan',
      header: 'RMan',
      enableColumnFilter: false,
      cell: (props) => props.getValue()
    }
  ),
  columnHelper.accessor((row) => row.materialRequest?.protocolNumber, {
    id: 'protocolNumberRM',
    header: 'RM',
    enableColumnFilter: false,
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.receiptDate, {
    id: 'receiptDate',
    enableColumnFilter: false,
    header: () => <div className='text-center'> Entrada</div>,
    cell: (props) => {
      const date = new Date(props.getValue());
      return (
        <div className='text-center'>
          {date.toLocaleDateString()}
          <br />
          {date.toLocaleTimeString()}
        </div>
      );
    }
  }),
  // columnHelper.accessor('id', {
  //   header: 'ID',
  //   size: 30,
  //   cell: (props) => props.getValue()
  // }),
  columnHelper.accessor((row) => row.processedByUser?.login, {
    id: 'processedByUserLogin',
    header: 'Processamento',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.materialRequest?.sipacUserLoginRequest, {
    id: 'sipacUserLoginRequest',
    header: 'Usuário RM',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor(
    (row) =>
      row.materialRequest?.requestDate
        ? row.materialRequest?.requestDate
        : 'N/A',
    {
      id: 'requestDate',
      header: () => <span className='center-text'>Data RM</span>,
      enableColumnFilter: false,
      cell: (props) => {
        if (props.getValue() === 'N/A')
          return <div className='text-center'>N/A</div>;
        const date = new Date(props.getValue());
        return <div className='text-center'>{date.toLocaleDateString()}</div>;
      }
    }
  ),
  // columnHelper.accessor((row) => row.destinationWarehouse?.name, {
  //   id: 'destinationWarehouseName',
  //   header: 'Depósito de Destino',
  //   cell: (props) => props.getValue()
  // }),
  // columnHelper.accessor((row) => row.sourceName, {
  //   id: 'sourceName',
  //   header: 'Fornecedor (ou doador)',
  //   cell: (props) => props.getValue()
  // }),
  // columnHelper.accessor((row) => row.externalReference, {
  //   id: 'externalReference',
  //   header: 'Documento de Entrada',
  //   cell: (props) => props.getValue()
  // }),

  columnHelper.accessor(
    (row) =>
      row.materialRequest?.sipacUnitCostId
        ? formatCodigoUnidade(
            row.materialRequest?.sipacUnitCost?.codigoUnidade,
            row.materialRequest?.sipacUnitCost?.sigla
          )
        : 'N/A',
    {
      id: 'unitCostSipac',
      header: 'Unidade Custo',
      cell: (props) => props.getValue()
    }
  ),

  columnHelper.accessor((row) => Number(row.valueReceipt), {
    id: 'valueReceipt',
    header: ({ column }) => {
      return (
        <div
          className='flex cursor-pointer items-center'
          onClick={() => column.toggleSorting()}
        >
          Valor
          <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
        </div>
      );
    },
    size: 60,
    enableResizing: false,
    enableColumnFilter: false,
    cell: (props) => (
      <div className='text-right'>
        {props.getValue().toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </div>
    )
  }),

  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      <div className='flex gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onEdit(row)}
        >
          <Edit className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onDelete(row)}
        >
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button>
      </div>
    )
  })
];

export const SubRowComponent = ({
  row
}: {
  row: Row<IMaterialReceiptWithRelations>;
}) => {
  const items = row.original.items || [];

  return (
    <div className='p-2 pl-8'>
      <div>
        <h4 className='mb-2 text-sm font-semibold'>Itens Recebidos:</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Material</TableHead>
              <TableHead>Denominação</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item: IMaterialReceiptItem, index: number) => (
                <TableRow key={item.id || index}>
                  <TableCell>{item.materialId}</TableCell>
                  <TableCell>{item.material?.name}</TableCell>
                  <TableCell>{item.material?.unitOfMeasure}</TableCell>
                  <TableCell>{item.quantityReceived.toString()}</TableCell>
                  <TableCell>
                    {item.unitPrice
                      ? Number(item.unitPrice).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })
                      : 'Indefinido'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  Nenhum item encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {row.original.notes && (
        <div className='bg-sisman-green/10 mt-4 p-4'>
          <h4 className='mb-2 text-sm text-xs font-semibold'>Observações:</h4>
          <div className='mb-2'>{row.original.notes}</div>
        </div>
      )}
    </div>
  );
};
