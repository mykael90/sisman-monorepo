'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, FilterX } from 'lucide-react';
import React, { EventHandler } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';

export function UserFilters({
  setColumnFilters
}: {
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}) {
  const [userValue, setUserValue] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const handleClearFilters = () => {
    setColumnFilters([]);
    setUserValue('');
    // Se os filtros de role e status estivessem ativos, você também os redefiniria aqui:
    // setRoleFilter('');
    // setStatusFilter('');
  };

  return (
    <div className='flex flex-col gap-4 md:flex-row'>
      <div className='relative flex-1'>
        <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
        <DebouncedInput
          type='text'
          placeholder='Search users...'
          className='pl-8'
          value={userValue}
          onChange={(newInputValue) => {
            // newInputValue é o valor do DebouncedInput (string | number)
            // Como o type do input é "text", esperamos uma string.
            const newStringValue = String(newInputValue);
            setUserValue(newStringValue); // Atualiza o estado local para o input

            setColumnFilters((prevFilters) => {
              const filterId = 'name';

              // Se o valor do input estiver vazio, remove o filtro 'name'
              if (newStringValue === '') {
                const updatedFilters = prevFilters.filter(
                  (f) => f.id !== filterId
                );
                // Retorna novo array apenas se algo mudou
                if (updatedFilters.length < prevFilters.length) {
                  return updatedFilters;
                }
                return prevFilters;
              }

              const existingFilterIndex = prevFilters.findIndex(
                (f) => f.id === filterId
              );

              if (existingFilterIndex !== -1) {
                // Filtro existe, atualiza o valor
                if (prevFilters[existingFilterIndex].value === newStringValue) {
                  return prevFilters; // Nenhum alteração necessária valor igual a anetrior
                }
                return prevFilters.map((filter, index) =>
                  index === existingFilterIndex
                    ? { ...filter, value: newStringValue }
                    : filter
                );
              } else {
                // Filtro não existe, adiciona
                return [
                  ...prevFilters,
                  { id: filterId, value: newStringValue }
                ];
              }
            });
          }}
        />
      </div>

      {/* <Select value={roleFilter} onValueChange={onRoleFilterChange}>
        <SelectTrigger className='w-full md:w-[180px]'>
          <SelectValue placeholder='All Roles' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='All Roles'>All Roles</SelectItem>
          <SelectItem value='Admin'>Admin</SelectItem>
          <SelectItem value='Editor'>Editor</SelectItem>
          <SelectItem value='Viewer'>Viewer</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className='w-full md:w-[180px]'>
          <SelectValue placeholder='All Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='All Status'>All Status</SelectItem>
          <SelectItem value='Active'>Active</SelectItem>
          <SelectItem value='Inactive'>Inactive</SelectItem>
        </SelectContent>
      </Select> */}

      <Button
        variant='outline'
        onClick={handleClearFilters}
        className='flex items-center'
      >
        <FilterX className='mr-2 h-4 w-4' />
        Clear Filters
      </Button>
    </div>
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, onChange, debounce]); // Adicionado onChange e debounce às dependências

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
