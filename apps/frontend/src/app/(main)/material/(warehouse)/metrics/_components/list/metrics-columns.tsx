import {
  ColumnDef,
  createColumnHelper,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { FileText, ChevronRight, ChevronDown, ArrowUpDown } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
  IMaterialStockMovementMetricsByWarehouse,
  IOperationMetrics,
  ICodeMetrics
} from '../../metrics-types'; // Importar os tipos corretos
import { InfoHoverCard } from '@/components/info-hover-card';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  materialOperationInDisplayMapPorguguese,
  materialOperationOutDisplayMapPorguguese,
  materialOperationAdjustmentDisplayMapPorguguese,
  materialOperationReservationDisplayMapPorguguese,
  materialOperationRestrictionDisplayMapPorguguese,
  TMaterialOperationInKey,
  TMaterialOperationOutKey,
  TMaterialOperationAdjustmentKey,
  TMaterialOperationReservationKey,
  TMaterialOperationRestrictionKey,
  materialOperationTypeDisplayMapPortuguese,
  TMaterialOperationTypeKey
} from '@/mappers/material-operations-mappers-translate';

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

export const defaultColumn: Partial<
  ColumnDef<IMaterialStockMovementMetricsByWarehouse>
> = {
  // Largura padrão
  // size: 150,
  enableResizing: true,
  // Filtro desligado por padrão
  enableColumnFilter: false,
  filterFn: 'arrIncludesSome'
  // Renderizador padrão da célula (texto simples)
  // cell: ({ getValue }) => {
  //   const value = getValue();
  //   if (value === null || value === undefined || value === '') {
  //     return <span className='text-muted-foreground'>N/A</span>;
  //   }
  //   return <div className='whitespace-normal'>{String(value)}</div>;
  // }
};

export const columns = (
  configuredActions: ActionHandlers<IMaterialStockMovementMetricsByWarehouse>
): ColumnDef<IMaterialStockMovementMetricsByWarehouse, any>[] => [
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
  columnHelper.accessor('materialId', {
    header: 'ID Material',
    size: 150,
    cell: (props) => props.getValue()
  }),
  columnHelper.accessor('materialName', {
    id: 'materialName',
    header: 'Material',
    enableResizing: false,
    size: 500,
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
    id: 'in',
    header: () => (
      <div className='w-full text-center font-medium'>Entradas</div>
    ),
    columns: [
      columnHelper.accessor('totalInCount', {
        id: 'totalInCount',
        size: 100,
        header: ({ column }) => {
          return (
            <div
              className='flex cursor-pointer items-center text-center'
              onClick={() => column.toggleSorting()}
            >
              Ocorrências
              <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
            </div>
          );
        },
        cell: (props) => (
          <div className='text-center'>{props.getValue() || '0'}</div>
        )
      }),
      columnHelper.accessor('totalInQuantity', {
        id: 'totalInQuantity',
        size: 100,
        header: ({ column }) => {
          return (
            <div
              className='flex cursor-pointer items-center text-center'
              onClick={() => column.toggleSorting()}
            >
              Quantidade
              <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
            </div>
          );
        },
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
      columnHelper.accessor('totalInValue', {
        id: 'totalInValue',
        size: 100,
        header: ({ column }) => {
          return (
            <div
              className='flex cursor-pointer items-center text-center'
              onClick={() => column.toggleSorting()}
            >
              Montante (R$)
              <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
            </div>
          );
        },
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
      // columnHelper.accessor('totalAdjustmentQuantity', {
      //   id: 'totalAdjustmentQuantity',
      //   size: 100,
      //   header: 'Ajuste',
      //   cell: (props) => (
      //     <div className='text-center'>
      //       {props.getValue()
      //         ? Number(props.getValue()).toLocaleString('pt-BR', {
      //             minimumFractionDigits: 2,
      //             maximumFractionDigits: 2
      //           })
      //         : '0,00'}
      //     </div>
      //   )
      // }),
      // columnHelper.accessor('totalReservationQuantity', {
      //   id: 'totalReservationQuantity',
      //   size: 100,
      //   header: 'Reserva',
      //   cell: (props) => (
      //     <div className='text-center'>
      //       {props.getValue()
      //         ? Number(props.getValue()).toLocaleString('pt-BR', {
      //             minimumFractionDigits: 2,
      //             maximumFractionDigits: 2
      //           })
      //         : '0,00'}
      //     </div>
      //   )
      // }),
      // columnHelper.accessor('totalRestrictionQuantity', {
      //   id: 'totalRestrictionQuantity',
      //   size: 100,
      //   header: 'Restrição',
      //   cell: (props) => (
      //     <div className='text-center'>
      //       {props.getValue()
      //         ? Number(props.getValue()).toLocaleString('pt-BR', {
      //             minimumFractionDigits: 2,
      //             maximumFractionDigits: 2
      //           })
      //         : '0,00'}
      //     </div>
      //   )
      // })
    ]
  }),
  columnHelper.display({
    id: 'separator-1',
    header: () => <div className='w-full'></div>,
    cell: () => <div className='w-full'></div>,
    size: 5,
    enableResizing: false
  }),
  columnHelper.group({
    id: 'Saídas',
    header: () => (
      <div className='w-full text-center font-medium'>Retiradas</div>
    ),
    columns: [
      columnHelper.accessor('totalOutCount', {
        id: 'totalOutCount',
        size: 100,
        header: ({ column }) => {
          return (
            <div
              className='flex cursor-pointer items-center text-center'
              onClick={() => column.toggleSorting()}
            >
              Ocorrências
              <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
            </div>
          );
        },
        cell: (props) => (
          <div className='text-center'>{props.getValue() || '0'}</div>
        )
      }),
      columnHelper.accessor('totalOutQuantity', {
        id: 'totalOutQuantity',
        size: 100,
        header: ({ column }) => {
          return (
            <div
              className='flex cursor-pointer items-center text-center'
              onClick={() => column.toggleSorting()}
            >
              Quantidade
              <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
            </div>
          );
        },
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
        header: ({ column }) => {
          return (
            <div
              className='flex cursor-pointer items-center text-center'
              onClick={() => column.toggleSorting()}
            >
              Montante (R$)
              <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
            </div>
          );
        },
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
      // columnHelper.accessor('totalAdjustmentValue', {
      //   id: 'totalAdjustmentValue',
      //   size: 100,
      //   header: 'Ajuste',
      //   cell: (props) => (
      //     <div className='text-center'>
      //       {props.getValue()
      //         ? Number(props.getValue()).toLocaleString('pt-BR', {
      //             minimumFractionDigits: 2,
      //             maximumFractionDigits: 2
      //           })
      //         : '0,00'}
      //     </div>
      //   )
      // }),
      // columnHelper.accessor('totalReservationValue', {
      //   id: 'totalReservationValue',
      //   size: 100,
      //   header: 'Reserva',
      //   cell: (props) => (
      //     <div className='text-center'>
      //       {props.getValue()
      //         ? Number(props.getValue()).toLocaleString('pt-BR', {
      //             minimumFractionDigits: 2,
      //             maximumFractionDigits: 2
      //           })
      //         : '0,00'}
      //     </div>
      //   )
      // }),
      // columnHelper.accessor('totalRestrictionValue', {
      //   id: 'totalRestrictionValue',
      //   size: 100,
      //   header: 'Restrição',
      //   cell: (props) => (
      //     <div className='text-center'>
      //       {props.getValue()
      //         ? Number(props.getValue()).toLocaleString('pt-BR', {
      //             minimumFractionDigits: 2,
      //             maximumFractionDigits: 2
      //           })
      //         : '0,00'}
      //     </div>
      //   )
      // })
    ]
  }),
  columnHelper.display({
    id: 'separator-2',
    header: () => <div className='w-full'></div>,
    cell: () => <div className='w-full'></div>,
    size: 5,
    enableResizing: false
  }),
  columnHelper.group({
    id: 'balance',
    header: () => <div className='w-full text-center font-medium'>Balanço</div>,
    columns: [
      columnHelper.accessor(
        (row) =>
          Number(row.totalInQuantity || 0) - Number(row.totalOutQuantity || 0),
        {
          id: 'balanceQuantity',
          size: 100,
          header: ({ column }) => {
            return (
              <div
                className='flex cursor-pointer items-center text-center'
                onClick={() => column.toggleSorting()}
              >
                Quantidade
                <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
              </div>
            );
          },
          cell: (props) => (
            <div className='text-center'>
              {props.getValue().toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          )
        }
      ),
      columnHelper.accessor(
        (row) => Number(row.totalInValue || 0) - Number(row.totalOutValue || 0),
        {
          id: 'balanceValue',
          size: 100,
          header: ({ column }) => {
            return (
              <div
                className='flex cursor-pointer items-center text-center'
                onClick={() => column.toggleSorting()}
              >
                Montante (R$)
                <ArrowUpDown className='text-muted-foreground ml-2 h-4 w-4' />
              </div>
            );
          },
          cell: (props) => (
            <div className='text-center'>
              {props.getValue().toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          )
        }
      )
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

export const SubRowComponent = ({
  row
}: {
  row: Row<IMaterialStockMovementMetricsByWarehouse>;
}) => {
  const operations = row.original.operations || [];

  return (
    <div className='p-2 pl-8'>
      <div>
        <h4 className='mb-2 text-sm font-semibold'>
          Métricas por Subtipos da Operação:
        </h4>
        {operations.length > 0 ? (
          operations.map((operation, opIndex) => (
            <div key={opIndex} className='mb-4 rounded-md border p-4'>
              <details>
                <summary>
                  <span className='mb-2 text-base font-bold capitalize'>
                    {
                      materialOperationTypeDisplayMapPortuguese[
                        operation.operation as TMaterialOperationTypeKey
                      ]
                    }
                  </span>
                </summary>
                <p>Total Ocorrências: {operation.operationTotalCount}</p>
                <p>
                  Total Quantidade:{' '}
                  {Number(operation.operationTotalQuantity).toLocaleString(
                    'pt-BR',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )}
                </p>
                <p className='mb-2'>
                  Total Montante (R$):{' '}
                  {Number(operation.operationTotalValue).toLocaleString(
                    'pt-BR',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }
                  )}
                </p>
                {operation.codes.length > 0 && (
                  <>
                    <h6 className='mb-2 text-sm font-semibold'>
                      Detalhes por Código:
                    </h6>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Ocorrências</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Montante (R$)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {operation.codes.map((codeMetrics, codeIndex) => (
                          <TableRow key={codeIndex}>
                            <TableCell>
                              {(() => {
                                switch (operation.operation) {
                                  case 'IN':
                                    return (
                                      materialOperationInDisplayMapPorguguese[
                                        codeMetrics.code as TMaterialOperationInKey
                                      ] || codeMetrics.code
                                    );
                                  case 'OUT':
                                    return (
                                      materialOperationOutDisplayMapPorguguese[
                                        codeMetrics.code as TMaterialOperationOutKey
                                      ] || codeMetrics.code
                                    );
                                  case 'ADJUSTMENT':
                                    return (
                                      materialOperationAdjustmentDisplayMapPorguguese[
                                        codeMetrics.code as TMaterialOperationAdjustmentKey
                                      ] || codeMetrics.code
                                    );
                                  case 'RESERVATION':
                                    return (
                                      materialOperationReservationDisplayMapPorguguese[
                                        codeMetrics.code as TMaterialOperationReservationKey
                                      ] || codeMetrics.code
                                    );
                                  case 'RESTRICTION':
                                    return (
                                      materialOperationRestrictionDisplayMapPorguguese[
                                        codeMetrics.code as TMaterialOperationRestrictionKey
                                      ] || codeMetrics.code
                                    );
                                  default:
                                    return codeMetrics.code;
                                }
                              })()}
                            </TableCell>
                            <TableCell>{codeMetrics.count}</TableCell>
                            <TableCell>
                              {Number(codeMetrics.totalQuantity).toLocaleString(
                                'pt-BR',
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              {Number(codeMetrics.totalValue).toLocaleString(
                                'pt-BR',
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </details>
            </div>
          ))
        ) : (
          <p>Nenhuma operação detalhada encontrada.</p>
        )}
      </div>
    </div>
  );
};
