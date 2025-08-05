'use client';

import { InputDebounce, InputDebounceRef } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, FilterX } from 'lucide-react';
import { memo } from 'react';

interface UserFiltersProps {
  userValue: string;
  setUserValue: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  onClearFilters: () => void; // Função para limpar vinda do pai
  // A prop que recebe a ref do pai (nome pode ser qualquer um)
  inputDebounceRef: React.Ref<InputDebounceRef>;
}

// Usando desestruturação nas props para clareza
const UserFilters = memo(function UserFilters({
  userValue,
  setUserValue,
  statusFilter,
  setStatusFilter,
  onClearFilters, // Recebe a função de limpar
  inputDebounceRef // Recebe a ref do pai
}: UserFiltersProps) {
  // O handleClearFilters agora simplesmente chama a função do pai
  const handleClearFilters = () => {
    onClearFilters();
  };

  // Usa diretamente os setters recebidos via props
  const handleStatusChange = (value: string) => {
    // Trata 'All Status' como um valor vazio para o estado no pai
    setStatusFilter(value === 'All Status' ? '' : value);
  };

  return (
    <div className='flex flex-col gap-4 md:flex-row'>
      <div className='relative flex-1'>
        <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
        <InputDebounce
          imperativeRef={inputDebounceRef}
          type='text'
          placeholder='Search users...'
          className='pl-8'
          // InputDebounce agora é controlado pelo estado do pai
          inputValue={userValue} // Passa o valor do pai
          setInputValue={setUserValue} // Passa o setter do pai
          // Use a versão refatorada do InputDebounce que lida bem com valor controlado
        />
      </div>

      <Select
        value={statusFilter || 'All Status'} // Mostra 'All Status' se o valor for vazio
        onValueChange={handleStatusChange} // Chama o handler que usa o setter do pai
      >
        <SelectTrigger className='w-full md:w-[180px]'>
          <SelectValue placeholder='All Status' />
        </SelectTrigger>
        <SelectContent>
          {/* O valor 'All Status' é tratado no handleStatusChange */}
          <SelectItem value='All Status'>All Status</SelectItem>
          <SelectItem value='true'>Active</SelectItem>
          <SelectItem value='false'>Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant='outline'
        onClick={handleClearFilters} // Chama a função de limpar do pai
        className='flex items-center'
      >
        <FilterX className='mr-2 h-4 w-4' />
        Limpar Filtros
      </Button>
    </div>
  );
});

export { UserFilters };
