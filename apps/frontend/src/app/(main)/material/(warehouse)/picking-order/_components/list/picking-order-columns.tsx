import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { IPickingOrderWithRelations } from '../../picking-order-types';
import { DefaultRowAction } from '../../../../../../../components/table-tanstack/default-row-action';
import { DataTableColumnHeader } from '../../../../../../../components/table-tanstack/data-table-column-header';
import {
  materialPickingOrderStatusDisplayMapPortuguese,
  TMaterialPickingOrderStatusKey
} from '../../../../../../../mappers/material-picking-order-mappers-translate';
import { Badge } from '@/components/ui/badge';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const columnHelper = createColumnHelper<IPickingOrderWithRelations>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const columns = (
  configuredActions: ActionHandlers<IPickingOrderWithRelations>
): ColumnDef<IPickingOrderWithRelations, any>[] => [
  columnHelper.accessor('id', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false
  }),
  columnHelper.accessor('status', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as TMaterialPickingOrderStatusKey;
      return (
        <div>
          {materialPickingOrderStatusDisplayMapPortuguese[status] || status}
        </div>
      );
    }
  }),
  columnHelper.accessor('createdAt', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data de Criação' />
    ),
    cell: ({ row }) => (
      <div>{new Date(row.getValue('createdAt')).toLocaleDateString()}</div>
    )
  }),
  columnHelper.accessor((row) => row.maintenanceRequest?.protocolNumber, {
    id: 'protocolNumberRMan',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='RMan' />
    ),
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.materialRequest?.protocolNumber, {
    id: 'protocolNumberRM',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='RM' />
    ),
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.warehouse?.name, {
    id: 'warehouseName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Armazém' />
    ),
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor(
    (row) => row.beCollectedByUser?.name || row.beCollectedByWorker?.name,
    {
      id: 'collectedBy',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Coletado Por' />
      ),
      cell: (props) => {
        const name = props.getValue();
        if (!name) {
          return 'N/A';
        }
        const isUser = !!props.row.original.beCollectedByUser;
        const isWorker = !!props.row.original.beCollectedByWorker;

        return (
          <div className='flex-col items-center space-y-1 whitespace-normal'>
            <div>{name}</div>
            <Badge variant={'outline'}>
              {isUser ? 'Usuário' : isWorker ? 'Profissional' : 'Outro'}
            </Badge>
          </div>
        );
      }
    }
  ),
  columnHelper.accessor(
    (row) => row.maintenanceRequest?.facilityComplex?.name,
    {
      id: 'facilityComplex',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Complexo' />
      ),
      cell: (props) => (
        <div className='whitespace-normal'>{props.getValue()}</div>
      )
    }
  ),
  columnHelper.accessor((row) => row.maintenanceRequest?.building?.name, {
    id: 'building',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ativo' />
    ),
    cell: (props) => <div className='whitespace-normal'>{props.getValue()}</div>
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => (
      <DefaultRowAction row={row} configuredActions={configuredActions} />
    )
  })
];

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IPickingOrderWithRelations> => ({
  onEdit: (row: Row<IPickingOrderWithRelations>) => {
    router.push(`picking-order/edit/${row.original.id}`);
  },
  onView: (row: Row<IPickingOrderWithRelations>) => {
    router.push(`picking-order/${row.original.id}`);
  }
});

export function SubRowComponent({
  row
}: {
  row: Row<IPickingOrderWithRelations>;
}) {
  return (
    <div className='p-4'>
      <p>Detalhes da Ordem de Reserva: {row.original.id}</p>
      {/* Adicione mais detalhes aqui conforme necessário */}
    </div>
  );
}
