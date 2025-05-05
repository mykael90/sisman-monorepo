'use client';

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
interface UserPaginationProps {
  currentPage: number;
  totalEntries: number;
  entriesPerPage: number;
  onPageChange: (page: number) => void;
}

export function UserPagination({
  currentPage,
  totalEntries,
  entriesPerPage,
  onPageChange
}: UserPaginationProps) {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  // const endEntry = Math.min(currentPage * entriesPerPage, totalEntries) // No longer needed for display
  const [inputValue, setInputValue] = useState<string>(currentPage.toString());

  // Update input value if currentPage changes externally
  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const goToPage = (value: string) => {
    const pageNumber = parseInt(value, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      if (pageNumber !== currentPage) {
        onPageChange(pageNumber);
      }
    } else {
      // Reset input to current page if invalid value is entered
      setInputValue(currentPage.toString());
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      goToPage(inputValue);
    }
  };

  const handleInputBlur = () => {
    // Optionally navigate on blur, or just reset if invalid
    goToPage(inputValue); // Or just reset: setInputValue(currentPage.toString()) if invalid
  };

  return (
    <div className='flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6'>
      <div className='text-muted-foreground text-sm'>
        {/* Showing {startEntry} to {endEntry} of {totalEntries} entries */}
        Total de {totalEntries} registro(s)
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className='h-4 w-4' />
          <span className='sr-only'>Primeira página</span>
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
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
            max={totalPages}
            className='h-8 w-14 text-center'
          />
          <span>de {totalPages}</span>
        </div>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className='h-4 w-4' />
          <span className='sr-only'>Próxima página</span>
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className='h-4 w-4' />
          <span className='sr-only'>Última página</span>
        </Button>
      </div>
    </div>
  );
}
