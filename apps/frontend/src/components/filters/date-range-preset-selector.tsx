'use client';

import * as React from 'react';
import {
  addDays,
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateRangePresetSelectorProps {
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  className?: string;
}

export function DateRangePresetSelector({
  setDate,
  className
}: DateRangePresetSelectorProps) {
  const [monthPickerOpen, setMonthPickerOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<Date | undefined>(
    undefined
  );

  const applyPreset = (days: number) => {
    const today = new Date();
    const from = subDays(today, days);
    setDate({ from, to: today });
  };

  const applyCurrentMonth = () => {
    const today = new Date();
    const from = startOfMonth(today);
    const to = endOfMonth(today);
    setDate({ from, to });
  };

  const applyCurrentYear = () => {
    const today = new Date();
    const from = startOfYear(today);
    const to = endOfYear(today);
    setDate({ from, to });
  };

  const applySpecificMonth = (date: Date | undefined) => {
    if (date) {
      const from = startOfMonth(date);
      const to = endOfMonth(date);
      setDate({ from, to });
      setSelectedMonth(date);
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Button variant='outline' onClick={() => applyPreset(6)}>
        Últimos 7 dias
      </Button>
      <Button variant='outline' onClick={() => applyPreset(14)}>
        Últimos 15 dias
      </Button>
      <Button variant='outline' onClick={() => applyPreset(29)}>
        Últimos 30 dias
      </Button>
      <Button variant='outline' onClick={() => applyPreset(59)}>
        Últimos 60 dias
      </Button>
      <Button variant='outline' onClick={() => applyPreset(179)}>
        Últimos 180 dias
      </Button>
      <Button variant='outline' onClick={() => applyPreset(364)}>
        Últimos 365 dias
      </Button>
      <Button variant='outline' onClick={applyCurrentMonth}>
        Mês atual
      </Button>
      <Button variant='outline' onClick={applyCurrentYear}>
        Ano atual
      </Button>

      <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' className='w-[180px]'>
            {selectedMonth
              ? format(selectedMonth, 'MMMM yyyy', { locale: ptBR })
              : 'Selecionar Mês'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar
            mode='single'
            captionLayout='dropdown'
            selected={selectedMonth}
            onSelect={(date) => {
              applySpecificMonth(date);
              setMonthPickerOpen(false);
            }}
            fromYear={2000}
            toYear={new Date().getFullYear()}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
