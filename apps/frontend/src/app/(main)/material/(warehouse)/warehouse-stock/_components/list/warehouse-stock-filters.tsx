'use client';

import { InputDebounce, InputDebounceRef } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, FilterX } from 'lucide-react';
import { memo } from 'react';

interface WarehouseStockFiltersProps {
  warehouseStockValue: string;
  setWarehouseStockValue: React.Dispatch<React.SetStateAction<string>>;
  onClearFilters: () => void;
  inputDebounceRef: React.Ref<InputDebounceRef>;
}

const WarehouseStockFilters = memo(function WarehouseStockFilters({
  warehouseStockValue,
  setWarehouseStockValue,
  onClearFilters,
  inputDebounceRef
}: WarehouseStockFiltersProps) {
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
          placeholder='Search warehouse stocks by ID...'
          className='pl-8'
          inputValue={warehouseStockValue}
          setInputValue={setWarehouseStockValue}
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

export { WarehouseStockFilters };
