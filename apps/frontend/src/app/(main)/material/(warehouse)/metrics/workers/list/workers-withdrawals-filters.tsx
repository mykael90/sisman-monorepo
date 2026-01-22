'use client';

import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';
import { memo } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangeFilter } from '@/components/filters/date-range-filter';

interface WorkersWithdrawalsFiltersProps {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  onClearFilters: () => void;
}

const WorkersWithdrawalsFilters = memo(function WorkersWithdrawalsFilters({
  date,
  setDate,
  onClearFilters
}: WorkersWithdrawalsFiltersProps) {
  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <div className='flex flex-col gap-4 md:flex-row'>
      <DateRangeFilter date={date} setDate={setDate} />

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

export { WorkersWithdrawalsFilters };
