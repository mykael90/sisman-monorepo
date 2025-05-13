import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Pagination } from './pagination';

interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  columnFilters?: ColumnFiltersState;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  pagination?: PaginationState;
  setPagination?: React.Dispatch<React.SetStateAction<any>>;
  setSorting?: React.Dispatch<React.SetStateAction<SortingState>>;
  sorting?: SortingState;
}

export function TableTanstack<TData>({
  data,
  columns,
  columnFilters,
  setColumnFilters,
  pagination,
  setPagination,
  setSorting,
  sorting
}: TableProps<TData>) {
  // 2. Instanciar a tabela com useReactTable
  const table = useReactTable({
    data: data,
    columns: columns, // Passa os callbacks para a definição das colunas
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    filterFns: {},
    state: {
      columnFilters,
      sorting,
      pagination
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: false
  });

  return (
    <div>
      <div className='border-md rounded-md'>
        <Table>
          <TableHeader className='bg-gray-100'>
            {/* 3. Renderizar cabeçalhos usando table.getHeaderGroups */}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {/* {header.column.getCanFilter() ? (
                      <div>
                        <Filter column={header.column} />
                      </div>
                    ) : null} */}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className='bg-white'>
            {/* 4. Renderizar linhas e células usando table.getRowModel e flexRender */}
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  // Aplica a classe específica apenas na célula 'name' para manter o layout do Avatar
                  <TableCell
                    key={cell.id}
                    className={`${cell.column.id === 'name' ? 'flex items-center gap-2' : ''} py-2.5`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='mt-1 h-14 rounded-b-md border-0 bg-white px-4 py-3.5'>
        <Pagination table={table} />
      </div>
    </div>
  );
}
