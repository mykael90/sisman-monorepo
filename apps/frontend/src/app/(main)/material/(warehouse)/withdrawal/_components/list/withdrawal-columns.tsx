import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { IMaterialWithdrawalWithRelations } from '../../../withdrawal/withdrawal-types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
  materialOperationOutDisplayMapPorguguese,
  TMaterialOperationOutKey
} from '../../../../../../../mappers/material-operations-mappers-translate';

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
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.movementType?.code, {
    id: 'movementTypeCode',
    header: 'Tipo de Saída',
    cell: (props) => (
      <>
        {
          materialOperationOutDisplayMapPorguguese[
            `${props.getValue()}` as TMaterialOperationOutKey
          ].split(' ')[1]
        }
      </>
    )
  }),
  columnHelper.accessor((row) => row.warehouse?.name, {
    id: 'warehouseName',
    header: 'Armazém',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.processedByUser?.name, {
    id: 'processedByUserName',
    header: 'Processado Por',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.collectedByUser?.name, {
    id: 'collectedByUserName',
    header: 'Coletado Por (Usuário)',
    cell: (props) => props.getValue()
  }),
  // columnHelper.accessor((row) => row.collectedByWorker?.name, {
  //   id: 'collectedByWorkerName',
  //   header: 'Coletado Por (Funcionário)',
  //   cell: (props) => props.getValue()
  // }),
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
