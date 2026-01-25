'use client';

import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/table-tanstack/data-table-column-header';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IRestrictionsItemsByWarehouseAndByMaterialId } from '../../restriction-order-types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Button } from '../../../../../../../components/ui/button';
import { ArrowUpDown, Edit, UnlockKeyhole } from 'lucide-react';
import { StatusRmBadge } from '../../../../request/_components/list/status-rm-badge';
import { InfoHoverCard } from '../../../../../../../components/info-hover-card';
import { useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { releaseRestrictionOrderItem } from '../../restriction-order-actions';
import { toast } from 'sonner';
import { QueryClient } from '@tanstack/react-query';

const columnHelper =
  createColumnHelper<IRestrictionsItemsByWarehouseAndByMaterialId>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance,
  queryClient: QueryClient
): ActionHandlers<IRestrictionsItemsByWarehouseAndByMaterialId> => {
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const userId = session?.user.idSisman
    ? Number(session.user.idSisman)
    : undefined;

  const handleReleaseMaterialRestrictionOrderItem = async (
    id: number,
    data: any
  ) => {
    // if (!userId) {
    //   toast.error(
    //     'ID do usuário não disponível. Não foi possível atualizar o status.'
    //   );
    //   return;
    // }
    startTransition(async () => {
      // When you use await inside a startTransition function, the state updates that happen after the await are not marked as Transitions. You must wrap state updates after each await in a startTransition call:

      const result = await releaseRestrictionOrderItem(id, data);
      if (result.isSubmitSuccessful) {
        startTransition(() => {
          toast.success(result.message);
          queryClient.invalidateQueries({
            queryKey: ['materialRestrictionByWarehouseIdAndMaterialId']
          }); // Invalida o cache do react-query
        });
      } else {
        toast.error(
          result.message || 'Erro liberar item da ordem de restrição.'
        );
      }
    });
  };

  return {
    onEdit: (row: Row<IRestrictionsItemsByWarehouseAndByMaterialId>) => {
      console.log('Edit Restriction', row.original);
      // if (row.original.id) {
      //   router.push(`withdrawal/edit/${row.original.id}`);
      // } else {
      //   console.error('Withdrawal ID is missing, cannot navigate to edit page.');
      //   throw new Error(
      //     'Withdrawal ID is missing, cannot navigate to edit page.'
      //   );
      // }
    },
    onRelease: (row: Row<IRestrictionsItemsByWarehouseAndByMaterialId>) => {
      console.log('Release item from restrictions', row.original);
      if (row.original.materialRestrictionOrderId) {
        handleReleaseMaterialRestrictionOrderItem(
          row.original.materialRestrictionOrderId,
          {
            notes: 'Liberação manual',
            items: [
              {
                id: row.original.id,
                globalMaterialId: row.original.globalMaterialId,
                quantityRestricted: 0,
                targetMaterialRequestItemId:
                  row.original.targetMaterialRequestItemId
              }
            ]
          }
        );
      } else {
        console.error(
          'Ordem de restrição não encontrada, não foi possível liberar item.'
        );
      }
    }
  };
};

export const columns = (
  configuredActions: ActionHandlers<IRestrictionsItemsByWarehouseAndByMaterialId>
): ColumnDef<IRestrictionsItemsByWarehouseAndByMaterialId, any>[] => [
  columnHelper.accessor((row) => row.materialRestrictionOrderId, {
    id: 'restricao',
    header: () => <div className='w-full text-center'>ID Rest</div>,
    size: 60,
    enableResizing: false,
    enableColumnFilter: false,
    cell: ({ getValue }) => (
      <div className='w-full text-center'>
        {getValue() as number | undefined}
      </div>
    )
  }),
  columnHelper.accessor((row) => row.updatedAt, {
    id: 'dataRestricao',
    header: ({ column }) => {
      return (
        <div
          className='flex cursor-pointer items-center text-center'
          onClick={() => column.toggleSorting()}
        >
          Data Restrição
          <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
        </div>
      );
    },
    size: 70,
    enableResizing: false,
    enableColumnFilter: false,
    cell: (props) => {
      const date = new Date(props.getValue());
      return (
        <div className='text-center'>
          <div>{date.toLocaleDateString('pt-BR')}</div>
        </div>
      );
    }
  }),
  columnHelper.accessor(
    (row) => row.materialRestrictionOrder.targetMaterialRequest?.protocolNumber,
    {
      id: 'rmVinculada',
      header: () => (
        <div className='flex items-center justify-center gap-2'>
          <div>{'RM'}</div>
          <InfoHoverCard
            title='Requisição de Material'
            content={
              <>
                <p className='pl-2'>
                  Número da requisição de material, acompanhado da data da
                  última sincronização do registro.
                </p>
              </>
            }
          />
        </div>
      ),
      size: 80,
      enableResizing: false,
      enableColumnFilter: false,
      cell: (props) => {
        const updateDate = new Date(props.row.original.updatedAt);

        return (
          <div className='space-y-.5 flex-col items-center whitespace-normal'>
            <div className='text-center'>{props.getValue()}</div>
            <div className='flex items-center justify-center gap-1'>
              <div className='text-muted-foreground text-xs'>
                {updateDate.toLocaleDateString()}{' '}
              </div>
            </div>
          </div>
        );
      }
    }
  ),
  columnHelper.accessor(
    (row) => row.materialRestrictionOrder.targetMaterialRequest?.currentStatus,
    {
      id: 'statusRm',
      header: () => <span>Status RM</span>, // Alterado
      enableColumnFilter: true,
      size: 150,
      enableResizing: false,
      filterFn: 'arrIncludesSome',
      cell: (props) => {
        const statusKey = props.getValue();
        return <StatusRmBadge statusKey={statusKey} />;
      }
    }
  ),
  columnHelper.accessor(
    (row) =>
      row.materialRestrictionOrder.targetMaterialRequest?.maintenanceRequest
        ?.protocolNumber,
    {
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
        if (!props.getValue()) {
          return 'N/A';
        }

        const updateDate = new Date(
          props.row.original.materialRestrictionOrder.targetMaterialRequest
            ?.maintenanceRequest?.updatedAt as unknown as string
        );

        return (
          <div className='space-y-.5 flex-col items-center whitespace-normal'>
            <div className='text-center'>{props.getValue()}</div>
            <div className='flex items-center justify-center gap-1'>
              <div className='text-muted-foreground text-xs'>
                {updateDate.toLocaleDateString()}{' '}
              </div>
            </div>
          </div>
        );
      }
    }
  ),
  columnHelper.accessor(
    (row) =>
      row.materialRestrictionOrder.targetMaterialRequest?.sipacUserLoginRequest,
    {
      id: 'solicitadoPor',
      header: () => <div className='w-full text-center'>Solicitado por</div>,
      size: 150,
      enableResizing: false,
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <div className='w-full text-center'>
          {getValue() as string | undefined}
        </div>
      )
    }
  ),
  columnHelper.accessor(
    (row) =>
      row.materialRestrictionOrder.targetMaterialRequest?.sipacUnitCost
        ?.nomeUnidade,
    {
      id: 'unidadeCusto',
      header: 'Unidade de Custo',
      size: 300,
      enableResizing: false,
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <div className=''>{getValue() as string | undefined}</div>
      )
    }
  ),
  // columnHelper.accessor('materialRestrictionOrder.notes', {
  //   id: 'notes',
  //   header: 'Notas',
  //   size: 200,
  //   enableResizing: false,
  //   enableColumnFilter: false,
  //   cell: ({ getValue }) => (
  //     <div className=''>{getValue() as string | undefined}</div>
  //   )
  // }),
  columnHelper.accessor((row) => row.quantityRestricted, {
    id: 'quantidadeRestrita',
    header: ({ column }) => (
      <div className='w-full text-center'>Quantidade Restrita</div>
    ),
    size: 80,
    enableResizing: false,
    enableColumnFilter: false,
    cell: ({ getValue }) => (
      <div className='w-full text-center'>
        {getValue() as string | undefined}
      </div>
    ),
    footer: ({ table }) => {
      const total = table
        .getFilteredRowModel()
        .rows.reduce(
          (sum, row) => sum + Number(row.original.quantityRestricted || 0),
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
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onRelease!(row)}
          title='Liberar material'
        >
          <UnlockKeyhole className='h-4 w-4' />
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
