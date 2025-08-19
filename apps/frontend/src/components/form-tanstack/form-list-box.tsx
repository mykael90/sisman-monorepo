import { useState, useRef, useEffect, useMemo } from 'react';
import { AnyFieldApi } from '@tanstack/react-form';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

export function FormListBox({
  field,
  label,
  showLabel = true,
  className = '',
  options,
  onValueChange,
  highlightFirstOnNoMatch = false,
  placeholder = 'Filtrar registros...',
  notFoundMessage = 'Nenhum registro encontrado.',
  ...props
}: {
  field: AnyFieldApi;
  label: string;
  showLabel?: boolean;
  className?: string;
  options: { value: string | number; label: string }[] | null;
  onValueChange?: (value: string) => void;
  highlightFirstOnNoMatch?: boolean;
  placeholder?: string;
  notFoundMessage?: string;
  [key: string]: any;
}) {
  const [filter, setFilter] = useState('');
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState(-1); // State for keyboard navigation
  const value = String(field.state.value);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return (
      options?.filter((option) =>
        String(option.label).toLowerCase().includes(filter.toLowerCase())
      ) ?? []
    );
  }, [options, filter]);

  // Determine the index of the currently selected value
  const selectedValueIndex = useMemo(() => {
    return filteredOptions?.findIndex(
      (option) => String(option.value) === value
    );
  }, [filteredOptions, value]);

  // The index that should be highlighted, prioritizing keyboard focus
  const highlightedIndex = useMemo(() => {
    if (keyboardFocusedIndex !== -1) {
      return keyboardFocusedIndex;
    }
    if (selectedValueIndex !== -1) {
      return selectedValueIndex;
    }
    if (highlightFirstOnNoMatch && filteredOptions.length > 0) {
      return 0;
    }
    return -1;
  }, [
    keyboardFocusedIndex,
    selectedValueIndex,
    filteredOptions.length,
    highlightFirstOnNoMatch
  ]);

  // This useEffect is for scrolling the focused item into view, which is a valid side effect.
  useEffect(() => {
    if (highlightedIndex !== -1 && listRef.current) {
      const focusedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setKeyboardFocusedIndex((prevIndex) =>
          Math.min(prevIndex + 1, filteredOptions.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setKeyboardFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex !== -1 && filteredOptions[highlightedIndex]) {
          const selectedValue = String(filteredOptions[highlightedIndex].value);
          field.handleChange(selectedValue);
          if (onValueChange) {
            onValueChange(selectedValue);
          }
          setKeyboardFocusedIndex(-1); // Reset keyboard focus on selection
          field.handleBlur();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setKeyboardFocusedIndex(-1); // Reset keyboard focus on escape
        field.handleBlur();
        break;
      default:
        break;
    }
  };

  return (
    <div className={className}>
      {showLabel && (
        <Label
          htmlFor={field.name}
          className='mb-1 block text-sm font-medium text-gray-700'
        >
          {label}
        </Label>
      )}
      <Input
        type='text'
        placeholder={placeholder}
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setKeyboardFocusedIndex(0); // Reset keyboard focus on filter change
        }}
        onKeyDown={handleKeyDown}
        className='mb-2'
      />
      <div
        ref={listRef}
        className='max-h-[8.75rem] overflow-y-auto rounded-md border p-1'
        tabIndex={0} // Make the div focusable
        onKeyDown={handleKeyDown}
      >
        {' '}
        {/* Approx 5 lines height for text-sm with p-1 */}
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => (
            <div
              key={String(option.value)}
              className={cn(
                'hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm p-1 text-sm leading-tight',
                value === String(option.value) &&
                  'bg-primary text-primary-foreground',
                highlightedIndex === index && 'bg-accent text-accent-foreground' // Highlight focused item
              )}
              onClick={() => {
                field.handleChange(String(option.value));
                if (onValueChange) {
                  onValueChange(String(option.value));
                }
                setKeyboardFocusedIndex(-1); // Reset keyboard focus on selection
                field.handleBlur(); // Simulate blur on selection
              }}
              {...props}
            >
              {option.label}
            </div>
          ))
        ) : (
          <p className='text-muted-foreground p-1 text-sm'>{notFoundMessage}</p>
        )}
      </div>
      {!field.state.meta.isValid && field.state.meta.isBlurred ? (
        <em className='mt-1 block text-xs text-red-500'>
          {field.state.meta.errors
            .map((error: any) => error.message)
            .join('; ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? (
        <em className='mt-1 text-xs text-blue-500'>Validating...</em>
      ) : null}
    </div>
  );
}
