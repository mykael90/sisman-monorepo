'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn, normalizeString } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInputDebounce,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ResponsiveComboboxProps {
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void; // Para o item SELECIONADO

  // MUDANÇA: Props para controlar o estado da busca vindo do pai
  searchValue: string;
  onSearchValueChange: (search: string) => void;

  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  closeOnSelect?: boolean;
  drawerTitle?: string;
  drawerDescription?: string;
  debounce?: number;
}

export function ResponsiveCombobox({
  options,
  onValueChange,
  searchValue,
  onSearchValueChange,
  placeholder = 'Selecione uma opção...',
  emptyMessage = 'Nenhuma opção encontrada.',
  className,
  closeOnSelect = true,
  drawerTitle,
  drawerDescription,
  debounce
}: ResponsiveComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      // Limpa a busca quando o combobox é fechado
      if (!isOpen) {
        onSearchValueChange('');
      }
    },
    [onSearchValueChange]
  );

  const triggerButton = (
    <Button
      variant='outline'
      role='combobox'
      aria-expanded={open}
      className={cn('justify-between', className)}
    >
      {/* MUDANÇA 2: O botão sempre mostra o placeholder. O estado está na tabela. */}
      {placeholder}
      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
    </Button>
  );

  // O Command não tem mais a prop 'filter'. Ele só exibe o que recebe.
  const commandContent = (
    <Command
      filter={() => {
        // Retornar 1 (ou qualquer valor "truthy") diz ao cmdk para sempre considerar o item uma correspondência.
        // Isso desabilita efetivamente seu filtro interno.
        return 1;
      }}
    >
      <div className='flex h-9 items-center border-b px-3'>
        {' '}
        {/* Adicionei este wrapper para layout */}
        <CommandInputDebounce
          placeholder='Buscar material...'
          value={searchValue}
          onValueChange={onSearchValueChange}
          debounce={debounce}
        />
      </div>
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={(currentValue: string) => {
                onValueChange(currentValue); // A lógica de 'currentValue === value' não é mais necessária
                if (closeOnSelect) {
                  // MUDANÇA 4: Usamos handleOpenChange para garantir que a busca seja limpa
                  handleOpenChange(false);
                }
              }}
            >
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent
          className={cn('p-0', className)}
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          {commandContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{drawerTitle || 'Selecione uma opção'}</DrawerTitle>
          <DrawerDescription>
            {drawerDescription || 'Busque e selecione um item da lista.'}
          </DrawerDescription>
        </DrawerHeader>
        <div className='p-4 pb-0'>{commandContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
