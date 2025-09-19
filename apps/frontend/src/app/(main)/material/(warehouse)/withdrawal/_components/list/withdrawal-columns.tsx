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
import { IMaterialWithdrawalWithRelations } from '../../../withdrawal/withdrawal-types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
  materialOperationOutDisplayMapPorguguese,
  TMaterialOperationOutKey
} from '../../../../../../../mappers/material-operations-mappers-translate';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

const columnHelper = createColumnHelper<IMaterialWithdrawalWithRelations>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IMaterialWithdrawalWithRelations> => ({
  onEdit: (row: Row<IMaterialWithdrawalWithRelations>) => {
    console.log('Edit withdrawal', row.original);
    if (row.original.id) {
      router.push(`withdrawal/edit/${row.original.id}`);
    } else {
      console.error('Withdrawal ID is missing, cannot navigate to edit page.');
      throw new Error(
        'Withdrawal ID is missing, cannot navigate to edit page.'
      );
    }
  },
  onDelete: (row: Row<IMaterialWithdrawalWithRelations>) => {
    console.log('Delete withdrawal', row.original);
  }
});

export const columns = (
  configuredActions: ActionHandlers<IMaterialWithdrawalWithRelations>
): ColumnDef<IMaterialWithdrawalWithRelations, any>[] => [
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
  // columnHelper.accessor('id', {
  //   header: 'ID',
  //   size: 30,
  //   cell: (props) => props.getValue()
  // }),
  columnHelper.accessor(
    (row) => {
      const code = row.movementType?.code;
      if (!code) {
        return 'N/A';
      }
      return (
        materialOperationOutDisplayMapPorguguese[
          code as TMaterialOperationOutKey
        ] || code
      );
    },
    {
      id: 'movementSubtype',
      header: 'Tipo de Saída',
      cell: (props) => <span className='capitalize'>{props.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: 'arrIncludesSome'
    }
  ),
  columnHelper.accessor((row) => row.maintenanceRequest?.protocolNumber, {
    id: 'protocolNumberRMan',
    header: 'RMan',
    enableColumnFilter: false,
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.materialRequest?.protocolNumber, {
    id: 'protocolNumberRM',
    header: 'RM',
    enableColumnFilter: false,
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.withdrawalDate, {
    id: 'withdrawalDate',
    enableColumnFilter: false,
    header: ({ column }) => {
      return (
        <div
          className='flex cursor-pointer items-center text-center'
          onClick={() => column.toggleSorting()}
        >
          Retirada
          <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
        </div>
      );
    },
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
  // columnHelper.accessor((row) => row.warehouse?.name, {
  //   id: 'warehouseName',
  //   header: 'Armazém',
  //   cell: (props) => props.getValue()
  // }),
  columnHelper.accessor((row) => row.processedByUser?.login, {
    id: 'processedByUserLogin',
    header: 'Expedição',
    cell: (props) => props.getValue()
  }),
  // columnHelper.accessor((row) => row.materialRequest?.sipacUserLoginRequest, {
  //   id: 'sipacUserLoginRequest',
  //   header: 'Usuário RM',
  //   cell: (props) => props.getValue()
  // }),
  // columnHelper.accessor((row) => row.materialRequest?.requestDate, {
  //   id: 'requestDate',
  //   header: 'Data RM',
  //   cell: (props) => {
  //     const date = new Date(props.getValue());
  //     return <div className='text-center'>{date.toLocaleDateString()}</div>;
  //   }
  // }),
  columnHelper.accessor(
    (row) =>
      row.collectedByUser?.name ||
      row.collectedByWorker?.name ||
      row.collectedByOther,
    {
      id: 'collectedBy',
      header: 'Coletado Por',
      size: 300,
      enableResizing: false,
      cell: (props) => {
        const name = props.getValue();
        if (!name) {
          return 'N/A';
        }
        const isUser = !!props.row.original.collectedByUser;
        const isWorker = !!props.row.original.collectedByWorker;
        const isOther = !!props.row.original.collectedByOther;

        return (
          <div className='flex-col items-center space-y-1 whitespace-normal'>
            <div>{name}</div>
            <Badge variant={'outline'}>
              {isUser ? 'Usuário' : isWorker ? 'Profisisonal' : 'Outro'}
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
      header: 'Complexo',
      enableResizing: false,
      size: 300,
      cell: (props) => (
        <div className='whitespace-normal'>{props.getValue()}</div>
      )
    }
  ),
  columnHelper.accessor((row) => row.maintenanceRequest?.building?.name, {
    id: 'building',
    header: 'Ativo',
    enableResizing: false,
    size: 400,
    cell: (props) => <div className='whitespace-normal'>{props.getValue()}</div>
  }),
  columnHelper.accessor((row) => Number(row.valueWithdrawal), {
    id: 'valueWithdrawal',
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
  // columnHelper.accessor((row) => row.materialRequest?.id, {
  //   id: 'materialRequestId',
  //   header: 'Requisição de Material',
  //   cell: (props) => props.getValue()
  // }),
  // columnHelper.accessor((row) => row.maintenanceRequest?.id, {
  //   id: 'maintenanceRequestId',
  //   header: 'Requisição de Manutenção',
  //   cell: (props) => props.getValue()
  // }),
  // columnHelper.accessor((row) => row.materialPickingOrder?.id, {
  //   id: 'materialPickingOrderId',
  //   header: 'Ordem de Separação',
  //   cell: (props) => props.getValue()
  // }),
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
        {/* <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onDelete(row)}
        >
          <Trash2 className='h-4 w-4 text-red-500' />
        </Button> */}
      </div>
    )
  })
];

export const SubRowComponent = ({
  row
}: {
  row: Row<IMaterialWithdrawalWithRelations>;
}) => {
  const items = row.original.items || [];
  // const itemsInfo = row.original.items.

  // const infoMap = useMemo(() => {
  //   const map = new Map<number, IMaterialWithdrawalWithRelations>();
  //   if (Array.isArray(items)) {
  //     items.forEach((item) => {
  //       map.set(item.key, item);
  //     });
  //   }
  //   return map;
  // }, []);

  return (
    <div className='p-2 pl-8'>
      <h4 className='mb-2 text-sm font-semibold'>Itens Retirados:</h4>
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
            items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.globalMaterialId}</TableCell>
                <TableCell>{item.globalMaterial?.name}</TableCell>
                <TableCell>{item.globalMaterial?.unitOfMeasure}</TableCell>
                <TableCell>{item.quantityWithdrawn.toString()}</TableCell>
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
  );
};
