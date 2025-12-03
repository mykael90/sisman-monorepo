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
  subDays,
  setMonth
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';

interface DateRangePresetSelectorProps {
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  className?: string;
}

export function DateRangePresetSelector({
  setDate,
  className
}: DateRangePresetSelectorProps) {
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>Intervalo de Datas</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56'>
          <DropdownMenuLabel>Intervalos Predefinidos</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => applyPreset(6)}>
            Últimos 7 dias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(14)}>
            Últimos 15 dias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(29)}>
            Últimos 30 dias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(59)}>
            Últimos 60 dias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(179)}>
            Últimos 180 dias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => applyPreset(364)}>
            Últimos 365 dias
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={applyCurrentMonth}>
            Mês atual
          </DropdownMenuItem>
          <DropdownMenuItem onClick={applyCurrentYear}>
            Ano atual
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Selecionar Mês (
              {format(selectedMonth ?? new Date(), 'yyyy', { locale: ptBR })})
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className='w-auto p-1'>
                {Array.from({ length: 12 }).map((_, i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => applySpecificMonth(setMonth(new Date(), i))}
                  >
                    {format(setMonth(new Date(), i), 'MMMM', { locale: ptBR })}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
