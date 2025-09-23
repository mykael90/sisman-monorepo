'use client';

import {
  ColumnDef,
  createColumnHelper,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { IMaterialPickingOrderWithRelations } from '../../material-picking-order-types';
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
  EllipsisVertical,
  Clock,
  Package,
  CheckCircle,
  MinusCircle,
  CheckSquare,
  XCircle,
  CalendarOff,
  Settings,
  FileText,
  Send,
  Undo,
  Truck,
  Inbox,
  UserCheck,
  Edit,
  CornerUpLeft
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../../../../../../../components/ui/popover';
import { updateMaterialPickingOrderStatusByOperation } from '../../material-picking-order-actions';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';

const columnHelper = createColumnHelper<IMaterialPickingOrderWithRelations>();

const pickingOrderStatusConfig: Record<
  TMaterialPickingOrderStatusKey,
  {
    label: string;
    icon: React.ElementType;
    variant:
      | 'default'
      | 'secondary'
      | 'destructive'
      | 'outline'
      | 'success'
      | 'warning';
  }
> = {
  PENDING_PREPARATION: {
    label: materialPickingOrderStatusDisplayMapPortuguese.PENDING_PREPARATION,
    icon: Clock,
    variant: 'warning'
  },
  IN_PREPARATION: {
    label: materialPickingOrderStatusDisplayMapPortuguese.IN_PREPARATION,
    icon: Package,
    variant: 'secondary'
  },
  READY_FOR_PICKUP: {
    label: materialPickingOrderStatusDisplayMapPortuguese.READY_FOR_PICKUP,
    icon: CheckCircle,
    variant: 'default'
  },
  PARTIALLY_WITHDRAWN: {
    label: materialPickingOrderStatusDisplayMapPortuguese.PARTIALLY_WITHDRAWN,
    icon: MinusCircle,
    variant: 'warning'
  },
  FULLY_WITHDRAWN: {
    label: materialPickingOrderStatusDisplayMapPortuguese.FULLY_WITHDRAWN,
    icon: CheckSquare,
    variant: 'success'
  },
  CANCELLED: {
    label: materialPickingOrderStatusDisplayMapPortuguese.CANCELLED,
    icon: XCircle,
    variant: 'destructive'
  },
  EXPIRED: {
    label: materialPickingOrderStatusDisplayMapPortuguese.EXPIRED,
    icon: CalendarOff,
    variant: 'destructive'
  }
};

const materialRequestStatusConfig: Record<
  StatusMaterialRequestKey,
  {
    label: string;
    icon: React.ElementType;
    variant:
      | 'default'
      | 'secondary'
      | 'destructive'
      | 'outline'
      | 'success'
      | 'warning';
  }
> = {
  SIPAC_HANDLING: {
    label: statusMaterialRequestDisplayMap.SIPAC_HANDLING,
    icon: Settings,
    variant: 'secondary'
  },
  REGISTERED: {
    label: statusMaterialRequestDisplayMap.REGISTERED,
    icon: FileText,
    variant: 'default'
  },
  PENDING: {
    label: statusMaterialRequestDisplayMap.PENDING,
    icon: Clock,
    variant: 'default'
  },
  CHANGE_SPONSOR: {
    label: statusMaterialRequestDisplayMap.CHANGE_SPONSOR,
    icon: RefreshCcw,
    variant: 'secondary'
  },
  APPROVED: {
    label: statusMaterialRequestDisplayMap.APPROVED,
    icon: CheckCircle,
    variant: 'success'
  },
  FORWARDED: {
    label: statusMaterialRequestDisplayMap.FORWARDED,
    icon: Send,
    variant: 'default'
  },
  PARTIALLY_ATTENDED: {
    label: statusMaterialRequestDisplayMap.PARTIALLY_ATTENDED,
    icon: MinusCircle,
    variant: 'warning'
  },
  FULLY_ATTENDED: {
    label: statusMaterialRequestDisplayMap.FULLY_ATTENDED,
    icon: CheckSquare,
    variant: 'success'
  },
  REJECTED: {
    label: statusMaterialRequestDisplayMap.REJECTED,
    icon: XCircle,
    variant: 'destructive'
  },
  CANCELLED: {
    label: statusMaterialRequestDisplayMap.CANCELLED,
    icon: XCircle,
    variant: 'destructive'
  },
  REVERSED: {
    label: statusMaterialRequestDisplayMap.REVERSED,
    icon: Undo,
    variant: 'secondary'
  },
  MATERIAL_SENT: {
    label: statusMaterialRequestDisplayMap.MATERIAL_SENT,
    icon: Truck,
    variant: 'default'
  },
  MATERIAL_RECEIVED: {
    label: statusMaterialRequestDisplayMap.MATERIAL_RECEIVED,
    icon: Inbox,
    variant: 'success'
  },
  PENDING_CHIEF: {
    label: statusMaterialRequestDisplayMap.PENDING_CHIEF,
    icon: UserCheck,
    variant: 'default'
  },
  CHANGED: {
    label: statusMaterialRequestDisplayMap.CHANGED,
    icon: Edit,
    variant: 'secondary'
  },
  ITEM_RETURNED: {
    label: statusMaterialRequestDisplayMap.ITEM_RETURNED,
    icon: CornerUpLeft,
    variant: 'secondary'
  },
  RETURNED: {
    label: statusMaterialRequestDisplayMap.RETURNED,
    icon: CornerUpLeft,
    variant: 'secondary'
  }
};

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const defaultColumn: Partial<
  ColumnDef<IMaterialPickingOrderWithRelations>
> = {
  // Largura padrão
  size: 150,
  enableResizing: false,
  // Filtro desligado por padrão
  enableColumnFilter: false,
  filterFn: 'arrIncludesSome',
  // Renderizador padrão da célula (texto simples)
  cell: ({ getValue }) => {
    const value = getValue();
    if (value === null || value === undefined || value === '') {
      return <span className='text-muted-foreground'>N/A</span>;
    }
    return <div className='whitespace-normal'>{String(value)}</div>;
  }
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
      enableColumnFilter: true,
      filterFn: 'arrIncludesSome',
      cell: ({ row }) => {
        const statusKey = row.original.status as TMaterialPickingOrderStatusKey;
        const config = pickingOrderStatusConfig[statusKey];
        if (!config) {
          return (
            <div className='whitespace-normal'>
              {materialPickingOrderStatusDisplayMapPortuguese[statusKey] ||
                statusKey}
            </div>
          );
        }
        const Icon = config.icon;
        return (
          <Badge variant={config.variant}>
            <Icon className='h-3 w-3' />
            {config.label}
          </Badge>
        );
      }
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
      cell: ({ row }) => {
        const statusKey = row.original.materialRequest
          ?.currentStatus as StatusMaterialRequestKey;
        if (!statusKey) {
          return <div className='whitespace-normal'>N/A</div>;
        }
        const config = materialRequestStatusConfig[statusKey];
        if (!config) {
          return (
            <div className='whitespace-normal'>
              {statusMaterialRequestDisplayMap[statusKey] || statusKey}
            </div>
          );
        }
        const Icon = config.icon;
        return (
          <Badge variant={config.variant}>
            <Icon className='h-3 w-3' />
            {config.label}
          </Badge>
        );
      }
    }
  ),
  columnHelper.accessor((row) => row.requestedByUser.login, {
    header: 'Solicitado por',
    id: 'requestedByUser',
    enableColumnFilter: true,
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
      enableColumnFilter: true,
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
    enableColumnFilter: true,
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='ghost' size='icon'>
              <EllipsisVertical className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-40 p-0'>
            <div className='flex flex-col gap-2 p-0'>
              <Button
                variant='ghost'
                size={'sm'}
                onClick={() => configuredActions.onReadyForPickup!(row)}
                className='m-0'
              >
                Reserva Separada
              </Button>
              <Button
                variant='ghost'
                size={'sm'}
                onClick={() => configuredActions.onFullyWithdrawn!(row)}
              >
                Reserva Retirada
              </Button>
              <Button
                variant='ghost'
                size={'sm'}
                onClick={() => configuredActions.onCancelled!(row)}
              >
                Cancelar Reserva
              </Button>
              {/* Adicione mais opções aqui conforme necessário */}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  })
];

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IMaterialPickingOrderWithRelations> => {
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const userId = session?.user.idSisman
    ? Number(session.user.idSisman)
    : undefined;

  const queryClient = useQueryClient();

  const handleStatusUpdate = async (
    id: number,
    status: 'READY_FOR_PICKUP' | 'FULLY_WITHDRAWN' | 'CANCELLED'
  ) => {
    if (!userId) {
      toast.error(
        'ID do usuário não disponível. Não foi possível atualizar o status.'
      );
      return;
    }
    startTransition(async () => {
      const result = await updateMaterialPickingOrderStatusByOperation(
        id,
        status,
        userId
      );
      if (result.isSubmitSuccessful) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['pickingOrders'] }); // Invalida o cache do react-query
      } else {
        toast.error(result.message || 'Erro ao atualizar o status da reserva.');
      }
    });
  };

  return {
    onEdit: (row: Row<IMaterialPickingOrderWithRelations>) => {
      router.push(`picking-order/edit/${row.original.id}`);
    },
    onView: (row: Row<IMaterialPickingOrderWithRelations>) => {
      router.push(`picking-order/${row.original.id}`);
    },
    onReadyForPickup: (row: Row<IMaterialPickingOrderWithRelations>) => {
      handleStatusUpdate(row.original.id, 'READY_FOR_PICKUP');
    },
    onFullyWithdrawn: (row: Row<IMaterialPickingOrderWithRelations>) => {
      handleStatusUpdate(row.original.id, 'FULLY_WITHDRAWN');
    },
    onCancelled: (row: Row<IMaterialPickingOrderWithRelations>) => {
      handleStatusUpdate(row.original.id, 'CANCELLED');
    }
  };
};

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
            <TableHead>Qtd Retirada</TableHead>
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
                  {(item.quantityWithdrawn || 0).toString()}
                </TableCell>
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
