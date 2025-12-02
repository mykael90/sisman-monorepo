import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { IMaterialStockMovementMetricsByWarehouse } from '../../metrics-types'; // Importar os tipos corretos
import { InfoHoverCard } from '@/components/info-hover-card';
import React from 'react';

const columnHelper =
  createColumnHelper<IMaterialStockMovementMetricsByWarehouse>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IMaterialStockMovementMetricsByWarehouse> => ({
  onViewDetails: (row: Row<IMaterialStockMovementMetricsByWarehouse>) => {
    console.log('View material metrics details', row.original);
    // TODO: Implementar navegação para uma página de detalhes de métricas, se houver.
    // router.push(`metrics/details/${row.original.materialId}`);
  }
});

export const columns = (
  configuredActions: ActionHandlers<IMaterialStockMovementMetricsByWarehouse>
): ColumnDef<IMaterialStockMovementMetricsByWarehouse, any>[] => [
  columnHelper.accessor('materialId', {
    header: 'ID Material',
    size: 150,
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('materialName', {
    id: 'materialName',
    header: 'Material',
    enableResizing: false,
    size: 300,
    cell: (props) => (
      <div className='flex items-center justify-between gap-2 whitespace-normal'>
        {props.getValue() || 'N/A'}{' '}
        {/* Assumindo que pode haver uma descrição para o material */}
        {/* <InfoHoverCard
          title='Descrição do Material'
          content={props.row.original.material?.description} // Ajustar se a descrição estiver disponível no tipo IMaterialStockMovementMetricsByWarehouse
          className='w-200'
        /> */}
      </div>
    )
  }),
  columnHelper.group({
    id: 'quantities',
    header: () => (
      <div className='text-center font-medium'>Quantidades Totais</div>
    ),
    columns: [
      columnHelper.accessor('totalInQuantity', {
        id: 'totalInQuantity',
        size: 100,
        header: 'Entrada',
        cell: (props) => (
          <div className='text-center'>
            {props.getValue()
              ? Number(props.getValue()).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </div>
        )
      }),
      columnHelper.accessor('totalOutQuantity', {
        id: 'totalOutQuantity',
        size: 100,
        header: 'Saída',
        cell: (props) => (
          <div className='text-center'>
            {props.getValue()
              ? Number(props.getValue()).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </div>
        )
      }),
      columnHelper.accessor('totalAdjustmentQuantity', {
        id: 'totalAdjustmentQuantity',
        size: 100,
        header: 'Ajuste',
        cell: (props) => (
          <div className='text-center'>
            {props.getValue()
              ? Number(props.getValue()).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </div>
        )
      }),
      columnHelper.accessor('totalReservationQuantity', {
        id: 'totalReservationQuantity',
        size: 100,
        header: 'Reserva',
        cell: (props) => (
          <div className='text-center'>
            {props.getValue()
              ? Number(props.getValue()).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </div>
        )
      }),
      columnHelper.accessor('totalRestrictionQuantity', {
        id: 'totalRestrictionQuantity',
        size: 100,
        header: 'Restrição',
        cell: (props) => (
          <div className='text-center'>
            {props.getValue()
              ? Number(props.getValue()).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </div>
        )
      })
    ]
  }),
  columnHelper.group({
    id: 'values',
    header: () => (
      <div className='text-center font-medium'>Valores Totais (R$)</div>
    ),
    columns: [
      columnHelper.accessor('totalInValue', {
        id: 'totalInValue',
        size: 100,
        header: 'Entrada',
        cell: (props) => (
          <div className='text-center'>
            {props.getValue()
              ? Number(props.getValue()).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </div>
        )
      }),
      columnHelper.accessor('totalOutValue', {
        id: 'totalOutValue',
        size: 100,
        header: 'Saída',
        cell: (props) => (
          <div className='text-center'>
            {props.getValue()
              ? Number(props.getValue()).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </div>
        )
      }),
      columnHelper.accessor('totalAdjustmentValue', {
        id: 'totalAdjustmentValue',
        size: 100,
        header: 'Ajuste',
        cell: (props) => (
          <div className='text-center'>
            {props.getValue()
              ? Number(props.getValue()).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </div>
        )
      }),
      columnHelper.accessor('totalReservationValue', {
        id: 'totalReservationValue',
        size: 100,
        header: 'Reserva',
        cell: (props) => (
          <div className='text-center'>
            {props.getValue()
              ? Number(props.getValue()).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </div>
        )
      }),
      columnHelper.accessor('totalRestrictionValue', {
        id: 'totalRestrictionValue',
        size: 100,
        header: 'Restrição',
        cell: (props) => (
          <div className='text-center'>
            {props.getValue()
              ? Number(props.getValue()).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              : '0,00'}
          </div>
        )
      })
    ]
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      <div className='flex gap-2'>
        <Button
          title='Ver detalhes das métricas do material'
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onViewDetails(row)}
        >
          <FileText className='h-4 w-4' />
        </Button>
      </div>
    )
  })
];
