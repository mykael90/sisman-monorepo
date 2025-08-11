'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Dispatch, SetStateAction } from 'react';

interface MaintenanceRequestFiltersProps {
  requestValue: string;
  setRequestValue: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  onClearFilters: () => void;
}

export function MaintenanceRequestFilters({
  requestValue,
  setRequestValue,
  statusFilter,
  setStatusFilter,
  onClearFilters
}: MaintenanceRequestFiltersProps) {
  const isFiltered = requestValue !== '' || statusFilter !== '';

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder='Filtrar por requisição...'
          value={requestValue}
          onChange={(event) => setRequestValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='h-8 w-[180px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='PENDING'>Pendente</SelectItem>
            <SelectItem value='IN_PROGRESS'>Em Progresso</SelectItem>
            <SelectItem value='COMPLETED'>Concluída</SelectItem>
            <SelectItem value='CANCELED'>Cancelada</SelectItem>
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={onClearFilters}
            className='h-8 px-2 lg:px-3'
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}