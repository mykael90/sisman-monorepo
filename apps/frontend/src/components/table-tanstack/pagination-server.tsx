'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Table } from '@tanstack/react-table';

interface PageNumberInputProps {
  currentPage: number;
  totalPages: number;
  onSetPage: (pageIndex: number) => void;
}

function PageNumberInput({
  currentPage,
  totalPages,
  onSetPage
}: PageNumberInputProps) {
  // Este estado será reinicializado quando o componente for recriado devido à mudança da key.
  const [inputValue, setInputValue] = useState<string>(currentPage.toString());

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const goToPage = (value: string) => {
    const pageNum = parseInt(value, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      if (pageNum !== currentPage) {
        onSetPage(pageNum - 1); // pageIndex é 0-based
        // A mudança de `currentPage` no pai fará este componente ser recriado, resetando `inputValue`.
      } else {
        // Normaliza o input se o número da página for o mesmo (ex: "03" para "3")
        setInputValue(currentPage.toString());
      }
    } else {
      // Reseta o input para a página atual se um valor inválido for inserido.
      setInputValue(currentPage.toString());
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Previne submissão de formulário, se aplicável
      goToPage(inputValue);
    }
  };

  const handleInputBlur = () => {
    goToPage(inputValue);
  };

  return (
    <div className='flex items-center space-x-2 text-sm'>
      <span>Pág.</span>
      <Input
        type='number'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={handleInputBlur}
        min={1}
        max={totalPages > 0 ? totalPages : 1}
        className='h-8 w-14 text-center'
      />
      <span>de {totalPages > 0 ? totalPages : 1}</span>
    </div>
  );
}

export function Pagination<TData>({ table }: { table: Table<TData> }) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1; // TanStack Table pageIndex is 0-based
  const totalPages = table.getPageCount();
  const totalEntries = table.getRowCount(); // Assumes table is configured to provide total row count

  return (
    <div className='flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6'>
      <div className='text-muted-foreground text-sm'>
        {/* Showing {startEntry} to {endEntry} of {totalEntries} entries */}
        Total de {totalEntries} registro(s)
      </div>
      <div className='flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end sm:gap-x-6 lg:gap-x-8'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className='h-4 w-4' />
            <span className='sr-only'>Primeira página</span>
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Página anterior</span>
          </Button>
          <PageNumberInput
            key={currentPage} // Chave para forçar a recriação e resetar o estado interno
            currentPage={currentPage}
            totalPages={totalPages}
            onSetPage={(newPageIndex) => table.setPageIndex(newPageIndex)}
          />
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className='h-4 w-4' />
            <span className='sr-only'>Próxima página</span>
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className='h-4 w-4' />
            <span className='sr-only'>Última página</span>
          </Button>
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        <p className='text-muted-foreground text-sm'>Registros por página:</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger size='sm' className='w-fit'>
            <SelectValue placeholder={`${pageSize}`} />
          </SelectTrigger>
          <SelectContent side='top'>
            {[10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
