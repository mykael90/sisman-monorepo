'use client';

import { InputDebounce, InputDebounceRef } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FilterX } from 'lucide-react';
import { memo } from 'react';

interface RoleFiltersProps {
  roleNameFilter: string;
  setRoleNameFilter: React.Dispatch<React.SetStateAction<string>>;
  // Adicione outros filtros aqui se necessário
  onClearFilters: () => void;
  inputDebounceRef: React.Ref<InputDebounceRef>;
}

const RoleFilters = memo(function RoleFilters({
  roleNameFilter,
  setRoleNameFilter,
  onClearFilters,
  inputDebounceRef
}: RoleFiltersProps) {
  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <div className='flex flex-col gap-4 md:flex-row'>
      <div className='relative flex-1'>
        <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
        <InputDebounce
          imperativeRef={inputDebounceRef}
          type='text'
          placeholder='Buscar papéis por nome...'
          className='pl-8'
          inputValue={roleNameFilter}
          setInputValue={setRoleNameFilter}
        />
      </div>

      <Button
        variant='outline'
        onClick={handleClearFilters}
        className='flex items-center'
      >
        <FilterX className='mr-2 h-4 w-4' />
        Limpar Filtros
      </Button>
    </div>
  );
});

export { RoleFilters };
