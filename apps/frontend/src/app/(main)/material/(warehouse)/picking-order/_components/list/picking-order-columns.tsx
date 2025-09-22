import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { IMaterialPickingOrderWithRelations } from '../../material-picking-order-types';
import { DefaultRowAction } from '../../../../../../../components/table-tanstack/default-row-action';
import { DataTableColumnHeader } from '../../../../../../../components/table-tanstack/data-table-column-header';
import {
  materialPickingOrderStatusDisplayMapPortuguese,
  TMaterialPickingOrderStatusKey
} from '../../../../../../../mappers/material-picking-order-mappers-translate';
import { Badge } from '@/components/ui/badge';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ArrowUpDown } from 'lucide-react';

const columnHelper = createColumnHelper<IMaterialPickingOrderWithRelations>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const columns = (
  configuredActions: ActionHandlers<IMaterialPickingOrderWithRelations>
): ColumnDef<IMaterialPickingOrderWithRelations, any>[] => [
  // columnHelper.accessor('id', {
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='ID' />
  //   ),
  //   cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
  //   enableSorting: false,
  //   enableHiding: false
  // }),
  columnHelper.accessor('status', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reserva' />
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
  columnHelper.accessor((row) => row.materialRequest?.currentStatus, {
    id: 'statusRM',
    header: 'Status RM',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('createdAt', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Gerada' />
    ),
    enableColumnFilter: false,
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className='text-center'>
          <div>{date.toLocaleDateString('pt-BR')}</div>
          <div>
            {date.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor((row) => row.requestedByUser.login, {
    header: 'Solicitado por',
    id: 'requestedByUser',
    size: 150,
    enableResizing: false,
    cell: (props) => <div className='whitespace-normal'>{props.getValue()}</div>
  }),
  columnHelper.accessor('desiredPickupDate', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Previsão' />
    ),
    enableColumnFilter: false,
    cell: ({ row }) => (
      <div className='text-center'>
        {new Date(row.getValue('createdAt')).toLocaleDateString()}
      </div>
    )
  }),
  // columnHelper.accessor((row) => row.warehouse?.name, {
  //   id: 'warehouseName',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Armazém' />
  //   ),
  //   cell: (props) => props.getValue()
  // }),
  columnHelper.accessor(
    (row) => row.beCollectedByUser?.name || row.beCollectedByWorker?.name,
    {
      id: 'beCollectedBy',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Reserva para' />
      ),
      size: 250,
      enableResizing: false,
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
  columnHelper.accessor((row) => Number(row.valuePickingOrder), {
    id: 'valuePickingOrder',
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
    size: 50,
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
    cell: ({ row }) => (
      <DefaultRowAction row={row} configuredActions={configuredActions} />
    )
  })
];

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IMaterialPickingOrderWithRelations> => ({
  onEdit: (row: Row<IMaterialPickingOrderWithRelations>) => {
    router.push(`picking-order/edit/${row.original.id}`);
  },
  onView: (row: Row<IMaterialPickingOrderWithRelations>) => {
    router.push(`picking-order/${row.original.id}`);
  }
});

export function SubRowComponent({
  row
}: {
  row: Row<IMaterialPickingOrderWithRelations>;
}) {
  return (
    <div className='p-4'>
      <p>Detalhes da Ordem de Reserva: {row.original.id}</p>
      {/* Adicione mais detalhes aqui conforme necessário */}
    </div>
  );
}
