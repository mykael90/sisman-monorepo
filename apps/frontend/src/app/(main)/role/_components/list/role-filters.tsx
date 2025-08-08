'use client';

import { InputDebounce, InputDebounceRef } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FilterX } from 'lucide-react';
import { memo } from 'react';

interface RoleFiltersProps {
  roleValue: string;
  setRoleValue: React.Dispatch<React.SetStateAction<string>>;
  onClearFilters: () => void;
  inputDebounceRef: React.Ref<InputDebounceRef>;
}

const RoleFilters = memo(function RoleFilters({
  roleValue,
  setRoleValue,
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
          placeholder='Search roles by name or description...'
          className='pl-8'
          inputValue={roleValue}
          setInputValue={setRoleValue}
        />
      </div>

      {/* No status filter needed for roles based on IRole */}

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
