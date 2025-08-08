import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { IWarehouse } from '../../warehouse-types';

interface WarehouseFiltersProps {
  table: Table<IWarehouse>;
}

export function WarehouseFilters({ table }: WarehouseFiltersProps) {
  return (
    <div className='flex items-center space-x-2'>
      <Input
        placeholder='Filtrar por nome...'
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('name')?.setFilterValue(event.target.value)
        }
        className='h-8 w-[150px] lg:w-[250px]'
      />
      <Input
        placeholder='Filtrar por código...'
        value={(table.getColumn('code')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('code')?.setFilterValue(event.target.value)
        }
        className='h-8 w-[150px] lg:w-[250px]'
      />
    </div>
  );
}
