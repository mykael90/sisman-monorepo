'use client';

import * as React from 'react';
import { addDays, format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface DateRangeFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DateRangeFilter({
  className,
  date,
  setDate
}: DateRangeFilterProps) {
  const handleDateChange = (newDate: DateRange | undefined) => {
    if (newDate?.from && newDate?.to) {
      const diffInDays = Math.round(
        (newDate.to.getTime() - newDate.from.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffInDays > 365) {
        // Se o intervalo for maior que 1 ano, ajusta a data final
        setDate({
          from: newDate.from,
          to: addDays(newDate.from, 365)
        });
        return;
      }
    }

    //dia inicial, momento 0
    if (newDate?.from) {
      newDate.from.setHours(0, 0, 0, 0);
    }

    //último momento do dia, inclui o dia todo na logica.
    if (newDate?.to) {
      newDate.to.setHours(23, 59, 59, 999);
    }

    setDate(newDate);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      {/* {JSON.stringify(date, null, 2)} */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                  {format(date.to, 'dd/MM/yyyy', { locale: ptBR })}
                </>
              ) : (
                format(date.from, 'dd/MM/yyyy', { locale: ptBR })
              )
            ) : (
              <span>Selecione um intervalo de datas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
