'use client';

import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { DateRange } from 'react-day-picker';

import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface DateRangeFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DateRangeFilter({
  className,
  date,
  setDate
}: DateRangeFilterProps) {
  const [startDateInput, setStartDateInput] = React.useState<string>('');
  const [endDateInput, setEndDateInput] = React.useState<string>('');
  const [isStartOpen, setIsStartOpen] = React.useState(false);
  const [isEndOpen, setIsEndOpen] = React.useState(false);

  React.useEffect(() => {
    if (date?.from) {
      setStartDateInput(format(date.from, 'dd/MM/yyyy'));
    } else {
      setStartDateInput('');
    }
    if (date?.to) {
      setEndDateInput(format(date.to, 'dd/MM/yyyy'));
    } else {
      setEndDateInput('');
    }
  }, [date]);

  const handleDateChange = (newDate: Partial<DateRange>) => {
    let from = newDate.from !== undefined ? newDate.from : date?.from;
    let to = newDate.to !== undefined ? newDate.to : date?.to;

    // Se a data final for anterior à data inicial, inverta-as
    if (from && to && from > to) {
      [from, to] = [to, from];
    }

    const finalDate: DateRange | undefined =
      from || to ? { from, to } : undefined;

    if (finalDate?.from) {
      finalDate.from.setHours(0, 0, 0, 0);
    }
    if (finalDate?.to) {
      finalDate.to.setHours(23, 59, 59, 999);
    }

    setDate(finalDate);
  };

  const parseAndSetDate = (dateString: string, field: 'from' | 'to') => {
    try {
      const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
      if (!isNaN(parsedDate.getTime())) {
        handleDateChange({ [field]: parsedDate });
      } else if (dateString === '') {
        handleDateChange({ [field]: undefined });
      }
    } catch (error) {
      // silent error
    }
  };

  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', className)}>
      <div className='grid gap-2'>
        <Label htmlFor='startDate'>Data inicial da consulta</Label>
        <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
          <PopoverTrigger asChild>
            <div className='relative'>
              <Input
                id='startDate'
                placeholder='Data de início'
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                onBlur={(e) => parseAndSetDate(e.target.value, 'from')}
                className={cn(
                  'w-full justify-start pl-3 text-left font-normal',
                  !date?.from && 'text-muted-foreground'
                )}
              />
              <CalendarIcon className='text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2' />
            </div>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={date?.from}
              onSelect={(d) => {
                handleDateChange({ from: d });
                setIsStartOpen(false);
              }}
              disabled={(d) => (date?.to ? d > date.to : false)}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='endDate'>Data final da consulta</Label>
        <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
          <PopoverTrigger asChild>
            <div className='relative'>
              <Input
                id='endDate'
                placeholder='Data de fim'
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                onBlur={(e) => parseAndSetDate(e.target.value, 'to')}
                className={cn(
                  'w-full justify-start pl-3 text-left font-normal',
                  !date?.to && 'text-muted-foreground'
                )}
              />
              <CalendarIcon className='text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2' />
            </div>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={date?.to}
              onSelect={(d) => {
                handleDateChange({ to: d });
                setIsEndOpen(false);
              }}
              disabled={(d) => (date?.from ? d < date.from : false)}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
