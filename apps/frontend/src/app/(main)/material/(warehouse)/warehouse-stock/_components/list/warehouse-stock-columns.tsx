import { ColumnDef, createColumnHelper, Row } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Edit, Info, Trash2, FileText, Calculator } from 'lucide-react';
import { IWarehouseStockWithRelations } from '../../warehouse-stock-types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';
import React from 'react';
import { InfoHoverCard } from '@/components/info-hover-card';
import { get } from 'http';

const columnHelper = createColumnHelper<IWarehouseStockWithRelations>();

type ActionHandlers<TData> = {
  [key: string]: (row: Row<TData>) => void;
};

export const createActions = (
  router: AppRouterInstance
): ActionHandlers<IWarehouseStockWithRelations> => ({
  onEdit: (row: Row<IWarehouseStockWithRelations>) => {
    console.log('Edit warehouse stock', row.original);
    if (row.original.id) {
      router.push(`warehouse-stock/edit/${row.original.id}`);
    } else {
      console.error(
        'Warehouse Stock ID is missing, cannot navigate to edit page.'
      );
      throw new Error(
        'Warehouse Stock ID is missing, cannot navigate to edit page.'
      );
    }
  },
  onDelete: (row: Row<IWarehouseStockWithRelations>) => {
    console.log('Delete warehouse stock', row.original);
  },
  onViewStatement: (row: Row<IWarehouseStockWithRelations>) => {
    console.log('View material statement', row.original);
    if (row.original.materialId && row.original.warehouseId) {
      router.push(
        `warehouse-stock/statement/${row.original.materialId}/${row.original.warehouseId}`
      );
    } else {
      console.error(
        'Material ID or Warehouse ID is missing, cannot navigate to statement page.'
      );
      throw new Error(
        'Material ID or Warehouse ID is missing, cannot navigate to statement page.'
      );
    }
  },
  onCount: (row: Row<IWarehouseStockWithRelations>) => {
    console.log('Count Material', row.original);
    if (row.original.id) {
      router.push(`/material/count/${row.original.id}`);
    } else {
      console.error('ID is missing, cannot navigate to count page.');
      throw new Error('ID is missing, cannot navigate to count page.');
    }
  }
});

export const columns = (
  configuredActions: ActionHandlers<IWarehouseStockWithRelations>
): ColumnDef<IWarehouseStockWithRelations, any>[] => [
  // columnHelper.accessor('id', {
  //   header: 'ID',
  //   size: 50,
  //   cell: (props) => props.getValue()
  // }),

  columnHelper.accessor('materialId', {
    header: 'ID Material',
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor((row) => row.material?.name, {
    id: 'materialName',
    header: 'Material',
    enableResizing: false,
    size: 400,
    cell: (props) => (
      <div className='flex items-center justify-between gap-2 whitespace-normal'>
        {props.getValue() || 'N/A'}{' '}
        <InfoHoverCard
          title='Descrição do Material'
          content={props.row.original.material?.description}
          className='w-200'
        />
      </div>
    )
  }),
  columnHelper.accessor((row) => row.lastStockCountDate, {
    id: 'lastStockCountDate',
    header: 'Última Contagem',
    cell: (props) => {
      const dateValue = props.getValue();
      return (
        <div className='text-center'>
          {dateValue ? format(new Date(dateValue), 'dd/MM/yyyy') : 'N/A'}
        </div>
      );
    }
  }),
  // columnHelper.accessor((row) => row.warehouse?.name, {
  //   id: 'warehouseName',
  //   header: 'Armazém',
  //   cell: (props) => props.getValue() || 'N/A'
  // }),
  columnHelper.group({
    id: 'quantities',
    header: () => <div className='text-center font-medium'>Quantidade</div>,
    columns: [
      columnHelper.accessor((row) => row.initialStockQuantity, {
        id: 'initialStockQuantity',
        size: 100,
        header: () => {
          return (
            <div className='flex items-center justify-center gap-2'>
              Inicial
              <InfoHoverCard
                title='Cálculo da Quantidade Inicial'
                subtitle='Representa a quantidade de material no depósito no momento em que se iniciou o SISMAN'
                content={
                  <>
                    <p className='pl-2 text-sm'>
                      Realizado por cálculo indireto no momento da realização da
                      primeira contagem do material
                    </p>
                    <p className='pl-2 text-green-700'>+ Primeira Contagem</p>
                    <p className='pl-2 text-red-700'>- Balanço</p>
                  </>
                }
              />
            </div>
          );
        },
        cell: (props) => (
          <div className='text-center'>
            {props.getValue() ? props.getValue().toString() : 'N/A'}
          </div>
        )
      }),
      columnHelper.accessor((row) => row.balanceInMinusOut, {
        // balanceInMinusOut não está no tipo atual
        id: 'balanceInMinusOut',
        size: 100,
        header: () => {
          return (
            <div className='flex items-center justify-center gap-2'>
              Balanço
              <InfoHoverCard
                title='Cálculo do Balanço'
                subtitle='Representa o que entrou menos o que saiu referente ao material'
                content={
                  <>
                    <p className='pl-2 text-green-700'>+ Soma de entradas</p>
                    <p className='pl-2 text-red-700'>
                      - Soma de saídas (retiradas)
                    </p>
                  </>
                }
              />
            </div>
          );
        },
        cell: (props) => (
          <div className='text-center'>
            {props.getValue() ? props.getValue().toString() : 'N/A'}
          </div>
        )
      }),
      columnHelper.accessor((row) => row.physicalOnHandQuantity, {
        id: 'physicalOnHandQuantity',
        size: 100,
        header: () => {
          return (
            <div className='flex items-center justify-center gap-2'>
              Saldo
              <InfoHoverCard
                title='Cálculo do Saldo'
                subtitle='Representa a quantidade de material que se encontra no depósito'
                content={
                  <>
                    <p className='pl-2 text-green-700'>+ Inicial</p>
                    <p className='pl-2 text-green-700'>+ Balanço</p>
                  </>
                }
              />
            </div>
          );
        },
        cell: (props) => (
          <div className='text-center'>
            {props.getValue() ? props.getValue().toString() : 'N/A'}
          </div>
        )
      }),
      columnHelper.accessor((row) => row.restrictedQuantity, {
        id: 'restrictedQuantity',
        size: 100,
        header: () => {
          return (
            <div className='flex items-center justify-center gap-2'>
              Restrita
              <InfoHoverCard
                title='Quantidade Restrita'
                subtitle='Representa a quantidade de material que está atrelada a requisições de materiais e não podem ser destinadas a outros usos'
              />
            </div>
          );
        },
        cell: (props) => (
          <div className='text-center'>
            {props.getValue() ? props.getValue().toString() : 'N/A'}
          </div>
        )
      }),
      columnHelper.accessor((row) => row.reservedQuantity, {
        id: 'reservedQuantity',
        size: 100,
        header: () => {
          return (
            <div className='flex items-center justify-center gap-2'>
              Reservada
              <InfoHoverCard
                title='Quantidade Reservada'
                subtitle='Representa a quantidade de material que está reservada, pronta para ser retirada'
              />
            </div>
          );
        },
        cell: (props) => (
          <div className='text-center'>
            {props.getValue() ? props.getValue().toString() : 'N/A'}
          </div>
        )
      }),
      columnHelper.accessor((row) => row.freeBalanceQuantity, {
        id: 'freeBalanceQuantity',
        size: 100,
        header: () => {
          return (
            <div className='flex items-center justify-center gap-2'>
              Livre
              <InfoHoverCard
                title='Quantidade livre'
                subtitle='Representa a quantidade de material disponível para retirada ou reserva genérica (sem está atrelada a uma requisição de material)'
                content={
                  <>
                    <p className='pl-2 text-green-700'>+ Saldo</p>
                    <p className='pl-2 text-red-700'>- Quantidade Restrita</p>
                    <p className='pl-2 text-red-700'>- Quantidade Reservada</p>
                  </>
                }
              />
            </div>
          );
        },
        cell: (props) => (
          <div className='text-center'>
            {props.getValue() ? props.getValue().toString() : 'N/A'}
          </div>
        )
      })
    ]
  }),
  columnHelper.accessor((row) => row.updatedCost, {
    id: 'updatedCost',
    size: 100,
    header: 'Unitário R$',
    cell: (props) =>
      props.getValue()
        ? Number(props.getValue()).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        : 'indefinido'
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      <div className='flex gap-2'>
        <Button
          title='Ver movimentações do material'
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onViewStatement(row)}
        >
          <FileText className='h-4 w-4' />
        </Button>
        {/* <Button
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onEdit(row)}
        >
          <Edit className='h-4 w-4' />
        </Button> */}
        <Button
          title='Realizar Contagem'
          variant='ghost'
          size='icon'
          onClick={() => configuredActions.onCount(row)}
        >
          <Calculator className='h-4 w-4' />
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
