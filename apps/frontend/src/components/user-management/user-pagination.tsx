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
import { cn } from '@/lib/utils';
import { Table } from '@tanstack/react-table';
import { UserWithRoles1 } from '../../../types/user';

interface UserPaginationProps {
  table: Table<UserWithRoles1>;
}

export function UserPagination({ table }: UserPaginationProps) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1; // TanStack Table pageIndex is 0-based
  const totalPages = table.getPageCount();
  const totalEntries = table.getRowCount(); // Assumes table is configured to provide total row count

  const [inputValue, setInputValue] = useState<string>(currentPage.toString());

  // Update input value if currentPage changes externally
  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]); // currentPage is derived from pageIndex

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const goToPage = (value: string) => {
    const pageNum = parseInt(value, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      if (pageNum !== currentPage) {
        table.setPageIndex(pageNum - 1); // pageIndex is 0-based
      }
    } else {
      // Reset input to current page if invalid value is entered
      // or if the entered page is the current page (to reflect actual state if input was, e.g. "03" for page 3)
      setInputValue(currentPage.toString());
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission if applicable
      goToPage(inputValue);
    }
  };

  const handleInputBlur = () => {
    goToPage(inputValue);
  };

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
          <div className='flex items-center space-x-2 text-sm'>
            <span>Página</span>
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
        <p className='text-muted-foreground text-sm'>Linhas por página:</p>
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
