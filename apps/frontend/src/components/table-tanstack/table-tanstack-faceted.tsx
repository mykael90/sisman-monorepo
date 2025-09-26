import {
  ColumnDef, //tipagem
  ColumnFiltersState,
  CustomFilterFns,
  FilterFnOption, //tipagem
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  GlobalFilterTableState,
  PaginationState, //tipagem
  SortingState, //tipagem
  useReactTable,
  getExpandedRowModel,
  Row,
  RowModel,
  Table as TTable
} from '@tanstack/react-table';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Pagination } from './pagination';
import { Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Command, CommandGroup, CommandItem, CommandList } from '../ui/command';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';

interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  columnFilters?: ColumnFiltersState;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  defaultColumn?: Partial<ColumnDef<TData>>;
  pagination?: PaginationState;
  setPagination?: React.Dispatch<React.SetStateAction<any>>;
  manualPagination?: boolean;
  rowCount?: number;
  setSorting?: React.Dispatch<React.SetStateAction<SortingState>>;
  sorting?: SortingState;
  globalFilterFn?: FilterFnOption<TData>;
  globalFilter?: any;
  setGlobalFilter?:
    | React.Dispatch<React.SetStateAction<string>>
    | ((value: string) => void);
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
  getRowClassName?: (row: Row<TData>) => string;
  getFacetedRowModel?: (
    table: TTable<TData>, // Recebe a instância da tabela
    columnId: string // Recebe o ID da coluna, conforme seu erro
  ) => () => RowModel<TData>;
  getFacetedUniqueValues?: (
    table: TTable<TData>,
    columnId: string
  ) => () => Map<unknown, number>;
  autoResetPageIndex?: boolean;
  debugTable?: boolean;
}

export function TableTanstackFaceted<TData>({
  data,
  columns,
  columnFilters,
  setColumnFilters,
  defaultColumn,
  pagination,
  setPagination,
  setSorting,
  sorting,
  globalFilterFn,
  globalFilter,
  setGlobalFilter,
  renderSubComponent,
  getRowClassName,
  getFacetedRowModel,
  getFacetedUniqueValues,
  autoResetPageIndex = true,
  manualPagination = false,
  rowCount,
  debugTable = false
}: TableProps<TData>) {
  const [expanded, setExpanded] = useState({});

  const table = useReactTable({
    data: data,
    columns: columns,
    defaultColumn: defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    manualPagination: manualPagination,
    rowCount: rowCount,
    autoResetPageIndex: autoResetPageIndex,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    getFacetedRowModel: getFacetedRowModel,
    getFacetedUniqueValues: getFacetedUniqueValues,
    filterFns: {},
    globalFilterFn,
    state: {
      globalFilter,
      columnFilters,
      sorting,
      pagination,
      expanded
    },
    debugTable: debugTable,
    debugHeaders: false,
    debugColumns: false
  });

  return (
    <div>
      <div className='border-md rounded-md'>
        <Table>
          <TableHeader className='bg-gray-100'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div className='flex items-center space-x-2'>
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {header.column.getCanFilter() &&
                          header.column.getFacetedUniqueValues()?.size > 0 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Filter
                                  className={cn(
                                    'text-muted-foreground h-4 w-4',
                                    {
                                      'text-accent':
                                        header.column.getIsFiltered()
                                    }
                                  )}
                                  strokeWidth={
                                    header.column.getIsFiltered() ? 3 : 1
                                  }
                                />
                              </PopoverTrigger>
                              <PopoverContent
                                className='w-[200px] p-0'
                                align='start'
                              >
                                <Command>
                                  <CommandList>
                                    <CommandGroup>
                                      {Array.from(
                                        header.column
                                          .getFacetedUniqueValues()
                                          ?.entries() || []
                                      )
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 5)
                                        .map(([value, count]) => {
                                          const isSelected = (
                                            (header.column.getFilterValue() as string[]) ||
                                            []
                                          ).includes(value);
                                          return (
                                            <CommandItem
                                              className=''
                                              key={value}
                                              onSelect={() => {
                                                const filterValue =
                                                  (header.column.getFilterValue() as string[]) ||
                                                  [];
                                                if (isSelected) {
                                                  header.column.setFilterValue(
                                                    filterValue.filter(
                                                      (v) => v !== value
                                                    )
                                                  );
                                                } else {
                                                  header.column.setFilterValue([
                                                    ...filterValue,
                                                    value
                                                  ]);
                                                }
                                              }}
                                            >
                                              <div
                                                className={cn(
                                                  'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border bg-white',
                                                  isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'opacity-50 [&_svg]:invisible'
                                                )}
                                              >
                                                <Checkbox
                                                  checked={isSelected}
                                                  className='h-4 w-4'
                                                />
                                              </div>
                                              <span>{value as string}</span>
                                              {count && (
                                                <span className='ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                                                  <Badge variant='secondary'>
                                                    {count}
                                                  </Badge>
                                                </span>
                                              )}
                                            </CommandItem>
                                          );
                                        })}
                                    </CommandGroup>
                                    {(header.column.getFilterValue() as
                                      | string
                                      | number) && (
                                      <>
                                        <Separator />
                                        <CommandGroup>
                                          <CommandItem
                                            onSelect={() =>
                                              header.column.setFilterValue(
                                                undefined
                                              )
                                            }
                                            className='justify-center text-center'
                                          >
                                            Limpar filtro
                                          </CommandItem>
                                        </CommandGroup>
                                      </>
                                    )}
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className='bg-white'>
            {table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow
                  className={cn(
                    getRowClassName
                      ? getRowClassName(row)
                      : 'hover:bg-accent/10 odd:bg-white even:bg-gray-50'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && renderSubComponent && (
                  <TableRow>
                    <TableCell colSpan={row.getVisibleCells().length}>
                      {renderSubComponent({ row })}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='h-min-14 mt-1 rounded-b-md border-0 bg-white px-4 py-3.5'>
        <Pagination table={table} />
      </div>
    </div>
  );
}
