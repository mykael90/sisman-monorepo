'use client';

import { FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  IWorkerManualFrequencyAdd,
  IWorkerManualFrequencyRelatedData
} from '../../worker-manual-frequency-types';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIconLucide } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface TableFormFrequencyItemsProps {
  items: (IWorkerManualFrequencyAdd & { key: number })[];
  onRemove: (key: number) => void;
  onUpdateField: (
    key: number,
    field: keyof IWorkerManualFrequencyAdd,
    value: any
  ) => void;
  relatedData: IWorkerManualFrequencyRelatedData;
  fieldLabels: { [k: string]: string };
}

export const TableFormFrequencyItems: FC<TableFormFrequencyItemsProps> = ({
  items,
  onRemove,
  onUpdateField,
  relatedData,
  fieldLabels
}) => {
  const { listWorkers, listWorkerManualFrequencyTypes } = relatedData;

  if (items.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        Nenhuma frequência adicionada.
      </div>
    );
  }

  return (
    <div className='mt-4 overflow-hidden rounded-lg border'>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-20 px-4 py-3 text-left text-sm font-medium text-gray-900'>
                {fieldLabels.workerId}
              </TableHead>
              <TableHead className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                {fieldLabels.date}
              </TableHead>
              <TableHead className='w-30 px-4 py-3 text-left text-sm font-medium text-gray-900'>
                {fieldLabels.hours}
              </TableHead>
              <TableHead className='w-32 px-4 py-3 text-left text-sm font-medium text-gray-900'>
                {fieldLabels.workerManualFrequencyTypeId}
              </TableHead>
              <TableHead className='w-40 px-4 py-3 text-left text-sm font-medium text-gray-900'>
                {fieldLabels.notes}
              </TableHead>
              <TableHead className='px-4 py-3 text-left text-sm font-medium text-gray-900'>
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.key} className='hover:bg-gray-50'>
                <TableCell className='w-min px-4 py-3 text-sm font-medium text-gray-900'>
                  <Select
                    value={String(item.workerId)}
                    onValueChange={(value) =>
                      onUpdateField(item.key, 'workerId', Number(value))
                    }
                  >
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder={fieldLabels.workerId} />
                    </SelectTrigger>
                    <SelectContent>
                      {listWorkers.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className='px-4 py-3 text-sm text-gray-900'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[180px] justify-start text-left font-normal',
                          !item.date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIconLucide className='mr-2 h-4 w-4' />
                        {item.date ? (
                          format(new Date(item.date), 'PPP', { locale: ptBR })
                        ) : (
                          <span>{fieldLabels.date}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={item.date ? new Date(item.date) : undefined}
                        onSelect={(date) =>
                          onUpdateField(item.key, 'date', date?.toISOString())
                        }
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className='px-4 py-3 text-sm text-gray-900'>
                  <Input
                    type='number'
                    value={item.hours}
                    onChange={(e) =>
                      onUpdateField(item.key, 'hours', Number(e.target.value))
                    }
                    className='w-[80px]'
                  />
                </TableCell>
                <TableCell className='px-4 py-3 text-sm text-gray-900'>
                  <Select
                    value={String(item.workerManualFrequencyTypeId)}
                    onValueChange={(value) =>
                      onUpdateField(
                        item.key,
                        'workerManualFrequencyTypeId',
                        Number(value)
                      )
                    }
                  >
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue
                        placeholder={fieldLabels.workerManualFrequencyTypeId}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {listWorkerManualFrequencyTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className='px-4 py-3 text-sm text-gray-900'>
                  <Input
                    value={item.notes || ''}
                    onChange={(e) =>
                      onUpdateField(item.key, 'notes', e.target.value)
                    }
                    className='w-[200px]'
                  />
                </TableCell>
                <TableCell className='px-4 py-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onRemove(item.key)}
                    className='hover:bg-destructive text-destructive hover:text-white'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
