'use client';

// InputDebounceRef e Search não são necessários, pois o filtro é de data
import { Button } from '@/components/ui/button';
import { FilterX } from 'lucide-react';
import { memo } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangeFilter } from '@/components/filters/date-range-filter'; // Componente correto

interface MetricsFiltersProps {
  date: DateRange | undefined; // Corrigido para 'date'
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>; // Corrigido para 'setDate'
  onClearFilters: () => void;
}

const MetricsFilters = memo(function MetricsFilters({
  date, // Corrigido para 'date'
  setDate, // Corrigido para 'setDate'
  onClearFilters
}: MetricsFiltersProps) {
  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <div className='flex flex-col gap-4 md:flex-row'>
      <DateRangeFilter
        date={date} // Corrigido para 'date'
        setDate={setDate} // Corrigido para 'setDate'
        // align='start' // 'align' não é uma prop do DateRangeFilter
      />

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

export { MetricsFilters };
