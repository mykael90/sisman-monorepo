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

interface WorkerFiltersProps {
  // Alterado para WorkerFiltersProps
  workerValue: string; // Alterado para workerValue
  setWorkerValue: React.Dispatch<React.SetStateAction<string>>; // Alterado para setWorkerValue
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  onClearFilters: () => void; // Função para limpar vinda do pai
  // A prop que recebe a ref do pai (nome pode ser qualquer um)
  inputDebounceRef: React.Ref<InputDebounceRef>;
}

// Usando desestruturação nas props para clareza
const WorkerFilters = memo(function WorkerFilters({
  // Alterado para WorkerFilters
  workerValue, // Alterado para workerValue
  setWorkerValue, // Alterado para setWorkerValue
  statusFilter,
  setStatusFilter,
  onClearFilters, // Recebe a função de limpar
  inputDebounceRef // Recebe a ref do pai
}: WorkerFiltersProps) {
  // Alterado para WorkerFiltersProps
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
          placeholder='Search workers...' // Alterado para 'Search workers...'
          className='pl-8'
          // InputDebounce agora é controlado pelo estado do pai
          inputValue={workerValue} // Passa o valor do pai // Alterado para workerValue
          setInputValue={setWorkerValue} // Passa o setter do pai // Alterado para setWorkerValue
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
          <SelectItem value='All Status'>Todos</SelectItem>
          <SelectItem value='Ativo'>Ativo</SelectItem>
          <SelectItem value='Inativo'>Inativo</SelectItem>
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

export { WorkerFilters }; // Alterado para WorkerFilters
