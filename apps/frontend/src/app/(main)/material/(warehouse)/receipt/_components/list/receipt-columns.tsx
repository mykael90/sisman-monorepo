import {
  ColumnDef,
  createColumnHelper,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
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
  columnHelper.accessor('id', {
    header: 'ID',
    size: 30,
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.movementType?.code, {
    id: 'movementTypeCode',
    header: 'Tipo de Entrada',
    cell: (props) => (
      <>
        {
          materialOperationInDisplayMapPorguguese[
            `${props.getValue()}` as TMaterialOperationInKey
          ].split(' ')[1]
        }
      </>
    )
  }),
  columnHelper.accessor((row) => row.destinationWarehouse?.name, {
    id: 'destinationWarehouseName',
    header: 'Depósito de Destino',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.processedByUser?.name, {
    id: 'processedByUserName',
    header: 'Processado Por',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.sourceName, {
    id: 'sourceName',
    header: 'Fornecedor (ou doador)',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.externalReference, {
    id: 'externalReference',
    header: 'Documento de Entrada',
    cell: (props) => props.getValue()
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
      <h4 className='mb-2 text-sm font-semibold'>Itens Recebidos:</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Material Global</TableHead>
            <TableHead>Nome do Material</TableHead>
            <TableHead>Unidade de Medida</TableHead>
            <TableHead>Quantidade Recebida</TableHead>
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
  );
};
