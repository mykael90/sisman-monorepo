'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn, normalizeString } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  closeOnSelect?: boolean; // New prop
  drawerTitle?: string;
  drawerDescription?: string;
}

export function ResponsiveCombobox({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione uma opção...',
  emptyMessage = 'Nenhuma opção encontrada.',
  className,
  closeOnSelect = true, // Default to true for existing behavior
  drawerTitle,
  drawerDescription
}: ResponsiveComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const triggerButton = (
    <Button
      variant='outline'
      role='combobox'
      aria-expanded={open}
      className={cn('justify-between', className)}
    >
      {value
        ? options.find((option) => option.value === value)?.label
        : placeholder}
      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
    </Button>
  );

  const commandContent = (
    <Command
      filter={(valueFromItem, search) => {
        const option = options.find((opt) => opt.value === valueFromItem);
        if (!option) {
          return 0; // No match if option not found
        }

        const normalizedLabel = normalizeString(option.label).toLowerCase();
        const normalizedSearchTerms = normalizeString(search)
          .toLowerCase()
          .split(' ')
          .filter(Boolean);

        // Check if all search terms are included in the label
        const allTermsMatch = normalizedSearchTerms.every((term: string) =>
          normalizedLabel.includes(term)
        );

        return allTermsMatch ? 1 : 0;
      }}
    >
      <CommandInput placeholder='Search option...' />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value} // Keep value as material ID for onSelect
              onSelect={(currentValue: string) => {
                onValueChange(currentValue === value ? '' : currentValue);
                if (closeOnSelect) {
                  setOpen(false);
                }
              }}
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  value === option.value ? 'opacity-100' : 'opacity-0'
                )}
              />
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{drawerTitle || 'Command Palette'}</DrawerTitle>
          <DrawerDescription>
            {drawerDescription || 'Search for a command to run...'}
          </DrawerDescription>
        </DrawerHeader>
        {commandContent}
      </DrawerContent>
    </Drawer>
  );
}
