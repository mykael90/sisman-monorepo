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

interface ReceiptFiltersProps {
  receiptValue: string;
  setReceiptValue: React.Dispatch<React.SetStateAction<string>>;
  onClearFilters: () => void;
  inputDebounceRef: React.Ref<InputDebounceRef>;
}

const ReceiptFilters = memo(function ReceiptFilters({
  receiptValue,
  setReceiptValue,
  onClearFilters,
  inputDebounceRef
}: ReceiptFiltersProps) {
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
          placeholder='Search receipts by ID...'
          className='pl-8'
          inputValue={receiptValue}
          setInputValue={setReceiptValue}
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

export { ReceiptFilters };
