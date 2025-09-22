import {
  ColumnDef,
  createColumnHelper,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { IMaterialPickingOrderWithRelations } from '../../material-picking-order-types';
import { DefaultRowAction } from '../../../../../../../components/table-tanstack/default-row-action';
import { DataTableColumnHeader } from '../../../../../../../components/table-tanstack/data-table-column-header';
import {
  materialPickingOrderStatusDisplayMapPortuguese,
  TMaterialPickingOrderStatusKey
} from '../../../../../../../mappers/material-picking-order-mappers-translate';
import {
  statusMaterialRequestDisplayMap,
  StatusMaterialRequestKey
} from '../../../../../../../mappers/material-request-mappers-translate';
import { Badge } from '@/components/ui/badge';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
  ArrowUpDown,
  RefreshCcw,
  ChevronRight,
  ChevronDown,
  Eye,
  EllipsisVertical
} from 'lucide-react';
import { Button } from '../../../../../../../components/ui/button';
import { InfoHoverCard } from '../../../../../../../components/info-hover-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

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
      const status = row.status as TMaterialPickingOrderStatusKey;
      return materialPickingOrderStatusDisplayMapPortuguese[status] || status;
    },
    {
      id: 'status',
      header: 'Reserva',
      size: 150,
      enableResizing: false,
      cell: (props) => (
        <div className='whitespace-normal'>{props.getValue()}</div>
      )
    }
  ),
  columnHelper.accessor('desiredPickupDate', {
    header: ({ column }) => {
      return (
        <div
          className='flex cursor-pointer items-center'
          onClick={() => column.toggleSorting()}
        >
          Previsão
          <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
        </div>
      );
    },
    size: 150,
    enableResizing: false,
    enableColumnFilter: false,
    cell: ({ row }) => (
      <div className='text-center'>
        {new Date(row.getValue('desiredPickupDate')).toLocaleDateString()}
      </div>
    )
  }),
  columnHelper.accessor((row) => row.maintenanceRequest?.protocolNumber, {
    id: 'protocolNumberRMan',
    header: () => (
      <div className='flex items-center justify-center gap-2'>
        <div>{'RMan'}</div>
        <InfoHoverCard
          title='Requisição de Manutenção'
          content={
            <>
              <p className='pl-2'>
                Número da requisição de manutenção, acompanhado da data da
                última sincronização do registro.
              </p>
            </>
          }
        />
      </div>
    ),
    size: 100,
    enableResizing: false,
    enableColumnFilter: false,
    cell: (props) => {
      if (!props.row.original.maintenanceRequest) {
        return 'N/A';
      }

      const updateDate = new Date(
        props.row.original.maintenanceRequest.updatedAt
      );

      return (
        <div className='space-y-.5 flex-col items-center whitespace-normal'>
          <div>{props.getValue()}</div>
          <div className='flex items-center justify-center gap-1'>
            <div className='text-muted-foreground text-xs'>
              {updateDate.toLocaleDateString()}{' '}
            </div>
            {/* <Button
              variant='ghost'
              onClick={() => {
                configuredActions.onView(props.row);
              }}
              className='h-3 w-3 cursor-pointer'
            >
              <RefreshCcw className='h-3 w-3' />
            </Button> */}
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor((row) => row.materialRequest?.protocolNumber, {
    id: 'protocolNumberRM',
    header: () => (
      <div className='flex items-center justify-center gap-2'>
        <div>{'RM'}</div>
        <InfoHoverCard
          title='Requisição de Material'
          content={
            <>
              <p className='pl-2'>
                Número da requisição de material, acompanhado da data da última
                sincronização do registro.
              </p>
            </>
          }
        />
      </div>
    ),
    size: 100,
    enableResizing: false,
    enableColumnFilter: false,
    cell: (props) => {
      if (!props.row.original.materialRequest) {
        return 'N/A';
      }

      const updateDate = new Date(props.row.original.materialRequest.updatedAt);

      return (
        <div className='space-y-.5 flex-col items-center whitespace-normal'>
          <div>{props.getValue()}</div>
          <div className='flex items-center justify-center gap-1'>
            <div className='text-muted-foreground text-xs'>
              {updateDate.toLocaleDateString()}{' '}
            </div>
            {/* <Button
              variant='ghost'
              onClick={() => {
                configuredActions.onView(props.row);
              }}
              className='m-0 h-2 w-2 cursor-pointer'
            >
              <RefreshCcw className='h-2 w-2' />
            </Button> */}
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor(
    (row) => {
      const status = row.materialRequest
        ?.currentStatus as StatusMaterialRequestKey;
      return status ? statusMaterialRequestDisplayMap[status] || status : '';
    },
    {
      id: 'statusRM',
      header: 'Status RM',
      cell: (props) => (
        <div className='whitespace-normal'>{props.getValue()}</div>
      )
    }
  ),
  columnHelper.accessor((row) => row.requestedByUser.login, {
    header: 'Solicitado por',
    id: 'requestedByUser',
    size: 150,
    enableResizing: false,
    cell: (props) => <div className='whitespace-normal'>{props.getValue()}</div>
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
      header: 'Reserva para',
      size: 400,
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
  // columnHelper.accessor(
  //   (row) => row.maintenanceRequest?.facilityComplex?.name,
  //   {
  //     id: 'facilityComplex',
  //     size: 500,
  //     enableResizing: false,
  //     header: 'Complexo',
  //     cell: (props) => (
  //       <div className='whitespace-normal'>{props.getValue()}</div>
  //     )
  //   }
  // ),
  columnHelper.accessor((row) => row.maintenanceRequest?.building?.name, {
    id: 'building',
    size: 600,
    enableResizing: false,
    header: 'Ativo',
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
  columnHelper.accessor('createdAt', {
    header: 'Gerada em',
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
  columnHelper.display({
    id: 'actions',
    // cell: ({ row }) => (
    //   <DefaultRowAction row={row} configuredActions={configuredActions} />
    // )
    cell: ({ row }) => (
      <div className='flex gap-2'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onView!(row)}
        >
          <Eye className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onView!(row)}
        >
          <EllipsisVertical className='h-4 w-4' />
        </Button>
      </div>
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

export const SubRowComponent = ({
  row
}: {
  row: Row<IMaterialPickingOrderWithRelations>;
}) => {
  const items = row.original.items || [];

  return (
    <div className='p-2 pl-8'>
      <h4 className='mb-2 text-sm font-semibold'>
        Itens da Ordem de Separação:
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Material</TableHead>
            <TableHead>Denominação</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Qtd Solicitada</TableHead>
            <TableHead>Qtd Separada</TableHead>
            <TableHead>Valor Unitário</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.globalMaterialId}</TableCell>
                <TableCell>{item.globalMaterial?.name || 'N/A'}</TableCell>
                <TableCell>
                  {item.globalMaterial?.unitOfMeasure || 'N/A'}
                </TableCell>
                <TableCell>{item.quantityToPick.toString()}</TableCell>
                <TableCell>{(item.quantityPicked || 0).toString()}</TableCell>
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
              <TableCell colSpan={6} className='h-24 text-center'>
                Nenhum item encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
