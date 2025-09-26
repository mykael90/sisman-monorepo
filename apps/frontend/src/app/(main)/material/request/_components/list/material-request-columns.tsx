'use client';

import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { IMaterialRequestWithRelations } from '../../material-request-types'; // Alterado
import {
  statusMaterialRequestDisplayMap, // Alterado
  StatusMaterialRequestKey // Alterado
} from '../../../../../../mappers/material-request-mappers-translate'; // Alterado
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
  CheckCircle,
  MinusCircle,
  CheckSquare,
  XCircle,
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
import { Button } from '../../../../../../components/ui/button';
import { InfoHoverCard } from '../../../../../../components/info-hover-card';
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
} from '../../../../../../components/ui/popover';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { QueryClient } from '@tanstack/react-query';
import { updateRequest } from '../../material-request-actions';
import { materialRequestStatusDisplayMap } from '../../../../../../mappers/material-request-mappers';

const columnHelper = createColumnHelper<IMaterialRequestWithRelations>(); // Alterado

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

export const createActions = (
  router: AppRouterInstance,
  queryClient: QueryClient
): ActionHandlers<IMaterialRequestWithRelations> => {
  // Alterado
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const userId = session?.user.idSisman
    ? Number(session.user.idSisman)
    : undefined;

  const handleStatusUpdate = async (
    id: number,
    status: StatusMaterialRequestKey // Alterado
  ) => {
    if (!userId) {
      toast.error(
        'ID do usuário não disponível. Não foi possível atualizar o status.'
      );
      return;
    }
    startTransition(async () => {
      const result = await updateRequest(
        null, // prevState
        { id: id, currentStatus: status } as any // Adapte conforme a interface IRequestEdit
      );
      if (result.isSubmitSuccessful) {
        startTransition(() => {
          toast.success(result.message);
          queryClient.invalidateQueries({ queryKey: ['materialRequests'] }); // Alterado
        });
      } else {
        toast.error(
          result.message || 'Erro ao atualizar o status da requisição.'
        ); // Alterado
      }
    });
  };

  return {
    onEdit: (row: Row<IMaterialRequestWithRelations>) => {
      // Alterado
      router.push(`request/edit/${row.original.id}`); // Alterado
    },
    onView: (row: Row<IMaterialRequestWithRelations>) => {
      // Alterado
      router.push(`request/${row.original.id}`); // Alterado
    },
    onApprove: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.APPROVED
      );
    },
    onReject: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.REJECTED
      );
    },
    onCancel: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.CANCELLED
      );
    },
    onForward: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.FORWARDED
      );
    },
    onReverse: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.REVERSED
      );
    },
    onMaterialSent: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.MATERIAL_SENT
      );
    },
    onMaterialReceived: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.MATERIAL_RECEIVED
      );
    },
    onPendingChief: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.PENDING_CHIEF
      );
    },
    onChanged: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.CHANGED
      );
    },
    onItemReturned: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.ITEM_RETURNED
      );
    },
    onReturned: (row: Row<IMaterialRequestWithRelations>) => {
      // Nova ação
      handleStatusUpdate(
        row.original.id,
        materialRequestStatusDisplayMap.RETURNED
      );
    }
  };
};

export const defaultColumn: Partial<
  ColumnDef<IMaterialRequestWithRelations> // Alterado
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
  configuredActions: ActionHandlers<IMaterialRequestWithRelations> // Alterado
): ColumnDef<IMaterialRequestWithRelations, any>[] => [
  // Alterado
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
      const status = row.currentStatus as StatusMaterialRequestKey; // Alterado
      return statusMaterialRequestDisplayMap[status] || status; // Alterado
    },
    {
      id: 'status',
      header: 'Requisição', // Alterado
      enableColumnFilter: true,
      filterFn: 'arrIncludesSome',
      cell: ({ row }) => {
        const statusKey = row.original
          .currentStatus as StatusMaterialRequestKey; // Alterado
        const config = materialRequestStatusConfig[statusKey]; // Alterado
        if (!config) {
          return (
            <div className='whitespace-normal'>
              {statusMaterialRequestDisplayMap[statusKey] || statusKey} //
              Alterado
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
  columnHelper.accessor('protocolNumber', {
    // Alterado
    header: ({ column }) => {
      return (
        <div
          className='flex cursor-pointer items-center'
          onClick={() => column.toggleSorting()}
        >
          Protocolo
          <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
        </div>
      );
    },
    size: 150,
    enableResizing: false,
    enableColumnFilter: false,
    cell: ({ row }) => (
      <div className='text-center'>{row.getValue('protocolNumber')}</div>
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
          </div>
        </div>
      );
    }
  }),
  columnHelper.accessor((row) => (row.requestedByUser as any)?.login, {
    // Alterado para lidar com 'requestedByUser' opcional e tipagem
    header: 'Solicitado por',
    id: 'requestedByUser',
    enableColumnFilter: true,
    cell: (props) => <div className='whitespace-normal'>{props.getValue()}</div>
  }),
  // Removida a coluna 'value' pois não existe diretamente em IMaterialRequestWithRelations
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
    header: 'Ações', // Alterado
    cell: ({ row }) => (
      <div className='flex gap-2'>
        <Button
          title='Detalhes da Requisição' // Alterado
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onView!(row)}
        >
          <Eye className='h-4 w-4' />
        </Button>
        <Button
          title='Editar Requisição' // Alterado
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onEdit!(row)}
        >
          <Edit className='h-4 w-4' />
        </Button>
        {row.original.currentStatus ===
          materialRequestStatusDisplayMap.PENDING && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='ghost' size='icon' title='Operação'>
                <EllipsisVertical className='h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-40 p-0'>
              <div className='flex flex-col gap-2 p-0'>
                <Button
                  variant='ghost'
                  size={'sm'}
                  onClick={() => configuredActions.onApprove!(row)}
                  className='m-0'
                >
                  Aprovar
                </Button>
                <Button
                  variant='ghost'
                  size={'sm'}
                  onClick={() => configuredActions.onReject!(row)}
                >
                  Rejeitar
                </Button>
                <Button
                  variant='ghost'
                  size={'sm'}
                  onClick={() => configuredActions.onCancel!(row)}
                >
                  Cancelar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {/* Adicione mais opções de ações aqui com base nos status da requisição */}
      </div>
    )
  })
];

export const SubRowComponent = ({
  row
}: {
  row: Row<IMaterialRequestWithRelations>; // Alterado
}) => {
  const items = row.original.items || [];

  return (
    <div className='p-2 pl-8'>
      <h4 className='mb-2 text-sm font-semibold'>
        Itens da Requisição de Material: // Alterado
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Material</TableHead>
            <TableHead>Denominação</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Qtd Solicitada</TableHead>
            <TableHead>Qtd Aprovada</TableHead>
            <TableHead>Valor Unitário</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.requestedGlobalMaterial?.id}</TableCell>{' '}
                {/* Alterado para acessar o ID do material global */}
                <TableCell>
                  {item.requestedGlobalMaterial?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  {item.requestedGlobalMaterial?.unitOfMeasure || 'N/A'}
                </TableCell>
                <TableCell>{item.quantityRequested.toString()}</TableCell>
                <TableCell>{(item.quantityApproved || 0).toString()}</TableCell>
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
