'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import {
  IWorkerManualFrequency,
  IWorkerManualFrequencyAdd,
  IWorkerManualFrequencyType
} from '../../worker-manual-frequency-types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IWorkerWithRelations } from '../../../worker/worker-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface TableFormFrequencyItemsProps {
  infoMap: Map<number, IWorkerWithRelations>;
  items: (IWorkerManualFrequencyAdd & { key: number })[];
  onRemove: (key: number) => void;
  onUpdateField: (
    key: number,
    field: 'hours' | 'notes' | 'workerManualFrequencyTypeId',
    value: string | number
  ) => void;
  listWorkerManualFrequencyTypes: IWorkerManualFrequencyType[];
  readOnly?: boolean;
}

export function TableFormFrequencyItems({
  infoMap,
  items,
  onRemove,
  onUpdateField,
  listWorkerManualFrequencyTypes,
  readOnly = false
}: TableFormFrequencyItemsProps) {
  if (items.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        {readOnly
          ? 'Nenhuma frequência para este trabalhador.'
          : 'Nenhuma frequência adicionada.'}
      </div>
    );
  }

  return (
    <div className='mt-4 overflow-hidden rounded-lg border'>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabalhador</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo de Frequência</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead>Notas</TableHead>
              {!readOnly && <TableHead>Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const info = infoMap.get(item.workerId);

              return (
                <TableRow key={item.key} className='hover:bg-gray-50'>
                  <TableCell>{info?.name ?? 'N/A'}</TableCell>
                  <TableCell>
                    {info?.workerContracts[0]?.workerSpecialty?.name ?? 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.date
                      ? format(new Date(item.date), 'PPP', { locale: ptBR })
                      : 'N/A'}
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
                        <SelectValue placeholder='Tipo de frequência' />
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
                  <TableCell>
                    {readOnly ? (
                      <p>{item.hours}</p>
                    ) : (
                      <Input
                        type='number'
                        value={item.hours}
                        onChange={(e) =>
                          onUpdateField(
                            item.key,
                            'hours',
                            Number(e.target.value)
                          )
                        }
                        className='w-[80px]'
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      <p>{item.notes}</p>
                    ) : (
                      <Input
                        value={item.notes || ''}
                        onChange={(e) =>
                          onUpdateField(item.key, 'notes', e.target.value)
                        }
                        className='w-[200px]'
                      />
                    )}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => onRemove(item.key)}
                        className='hover:bg-destructive text-destructive hover:text-white'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
