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

interface WithdrawalFiltersProps {
  withdrawalValue: string;
  setWithdrawalValue: React.Dispatch<React.SetStateAction<string>>;
  onClearFilters: () => void;
  inputDebounceRef: React.Ref<InputDebounceRef>;
}

const WithdrawalFilters = memo(function WithdrawalFilters({
  withdrawalValue,
  setWithdrawalValue,
  onClearFilters,
  inputDebounceRef
}: WithdrawalFiltersProps) {
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
          placeholder='Search withdrawals by ID...'
          className='pl-8'
          inputValue={withdrawalValue}
          setInputValue={setWithdrawalValue}
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

export { WithdrawalFilters };
