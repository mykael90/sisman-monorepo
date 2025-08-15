'use client';

import { InputDebounce, InputDebounceRef } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filter, FilterX, Search, XCircle } from 'lucide-react';
import { Dispatch, SetStateAction, RefObject } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface RequisicoesManutencoesFiltersProps {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  onClearFilters: () => void;
  inputDebounceRef: RefObject<InputDebounceRef | null>;
}

export function RequisicoesManutencoesFilters({
  searchValue,
  setSearchValue,
  statusFilter,
  setStatusFilter,
  onClearFilters,
  inputDebounceRef
}: RequisicoesManutencoesFiltersProps) {
  return (
    <div className='flex flex-col gap-4 md:flex-row'>
      <div className='min-w-[200px] flex-1'>
        <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
        <InputDebounce
          imperativeRef={inputDebounceRef}
          id='search'
          placeholder='Ex: 12345/2023 ou Vazamento'
          inputValue={searchValue}
          setInputValue={setSearchValue}
        />
      </div>

      <div className='min-w-[150px]'>
        {/* <Label htmlFor='status'>Status</Label> */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger id='status'>
            <SelectValue placeholder='Filtrar por status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos</SelectItem>
            <SelectItem value='ABERTA'>Aberta</SelectItem>
            <SelectItem value='EM_ANDAMENTO'>Em Andamento</SelectItem>
            <SelectItem value='CONCLUIDA'>Concluída</SelectItem>
            <SelectItem value='CANCELADA'>Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant='outline'
        onClick={onClearFilters}
        className='flex items-center gap-2'
      >
        <FilterX className='mr-2 h-4 w-4' />
        Limpar Filtros
      </Button>
    </div>
  );
}
