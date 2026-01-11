import { AnyFieldApi } from '@tanstack/react-form';
import { Input } from '../ui/input';
import { CalendarIcon, Search, Paperclip } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Label } from '../ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker'; // Importa DateRange
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import {
  SelectContentModal,
  SelectGroupModal,
  SelectItemModal,
  SelectLabelModal,
  SelectTriggerModal,
  SelectValueModal
} from '../ui/selectModal';
import { Combobox } from '../ui/combobox';

// Componente FormInputField usando AnyFieldApi
export const FormInputField = React.forwardRef<
  HTMLInputElement,
  {
    field: AnyFieldApi;
    label?: string;
    type?: string;
    placeholder?: string;
    showLabel?: boolean;
    className?: string;
    onValueBlurParser?: (value: string) => any;
    [key: string]: any;
  }
>(
  (
    {
      field,
      label,
      type = 'text',
      placeholder,
      showLabel = true,
      className = '',
      onValueBlurParser,
      ...props
    },
    ref
  ) => {
    // Como AnyFieldApi é genérico (any para muitos tipos internos),
    // você pode precisar de algumas asserções de tipo ao acessar propriedades
    // se o TypeScript não puder inferir o tipo específico que você espera.
    // No entanto, para propriedades comuns como 'name', 'state.value', 'handleChange', 'handleBlur',
    // e 'state.meta', geralmente funciona bem.

    const value = field.state.value as string; // Asserção para input de texto
    //   const errors = field.state.meta.errors as string[] | undefined; // Asserção para o formato esperado de erros

    return (
      <div className={className}>
        {showLabel && label && (
          <label
            htmlFor={field.name}
            className='mb-1 block text-sm font-medium text-gray-700'
          >
            {label}
          </label>
        )}
        <Input
          ref={ref}
          id={field.name}
          name={field.name}
          value={value}
          onBlur={(e) => {
            if (onValueBlurParser) {
              const parsedValue = onValueBlurParser(e.target.value);
              field.handleChange(parsedValue);
            }
            field.handleBlur();
          }}
          onChange={(e) =>
            type === 'number'
              ? field.handleChange(Number(e.target.value))
              : field.handleChange(e.target.value)
          }
          type={type}
          placeholder={placeholder}
          {...props}
        />
        {/* Exibindo informações de erro e validação como no exemplo fornecido */}
        {/* {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? ( */}
        {!field.state.meta.isValid && field.state.meta.isBlurred ? (
          // Acessando field.state.meta.errors diretamente.
          // A biblioteca garante que errors é um array.
          // O exemplo original usava !field.state.meta.isValid, o que também é válido.
          // Usar errors.length > 0 é muitas vezes mais direto.
          <em className='mt-1 block text-xs text-red-500'>
            {/* Mapeia os erros para extrair apenas a propriedade 'message' e depois junta com vírgula */}
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
);

FormInputField.displayName = 'FormInputField';

export function FormDropdown({
  field,
  label,
  placeholder,
  showLabel = true,
  showLabelOnSelect = true,
  className = '',
  options,
  onValueChange,
  onValueBlurParser,
  modal = false,
  ...props
}: {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  showLabel?: boolean;
  showLabelOnSelect?: boolean;
  className?: string;
  options: { value: string | number; label: string }[];
  onValueChange?: (value: string) => void;
  onValueBlurParser?: (value: string) => any;
  modal?: boolean;
  [key: string]: any;
}) {
  const value = String(field.state.value);

  return (
    <div className={className}>
      {showLabel && label && (
        <label
          htmlFor={field.name}
          className='mb-1 block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      )}
      <Select
        value={value}
        onValueChange={(val) => {
          const finalValue = onValueBlurParser ? onValueBlurParser(val) : val;
          field.handleChange(finalValue);
          if (onValueChange) {
            onValueChange(finalValue);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            field.handleBlur();
          }
        }}
        {...props}
      >
        <SelectTrigger className='w-full'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {showLabelOnSelect && <SelectLabel>{label}</SelectLabel>}
            {options.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
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

export function FormInputFile({
  field,
  label,
  showLabel = true,
  className = '',
  placeholder = 'Selecionar arquivo',
  ...props
}: {
  field: AnyFieldApi;
  label?: string;
  showLabel?: boolean;
  className?: string;
  placeholder?: string;
  [key: string]: any;
}) {
  const value = field.state.value as File | undefined;

  return (
    <div className={className}>
      {showLabel && label && (
        <label
          htmlFor={field.name}
          className='mb-1 block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      )}
      <div className='flex items-center gap-2'>
        <input
          type='file'
          id={field.name}
          name={field.name}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              field.handleChange(file);
            }
          }}
          onBlur={field.handleBlur}
          className='hidden'
          {...props}
        />
        <Button
          type='button'
          variant='outline'
          onClick={() => document.getElementById(field.name)?.click()}
          className='w-full justify-start'
        >
          <Paperclip className='mr-2 h-4 w-4' />
          {value ? value.name : placeholder}
        </Button>
      </div>

      {!field.state.meta.isValid &&
      (field.state.meta.isBlurred || field.state.meta.isTouched) ? (
        <em className='mt-1 block text-xs text-red-500'>
          {field.state.meta.errors
            .map((error: any) =>
              typeof error === 'object' ? error.message : error
            )
            .join('; ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? (
        <em className='mt-1 text-xs text-blue-500'>Validating...</em>
      ) : null}
    </div>
  );
}

export function FormInputFileBatch({
  field,
  label,
  showLabel = true,
  className = '',
  placeholder = 'Selecionar arquivos',
  ...props
}: {
  field: AnyFieldApi;
  label?: string;
  showLabel?: boolean;
  className?: string;
  placeholder?: string;
  [key: string]: any;
}) {
  const values = (field.state.value as File[]) || [];

  return (
    <div className={className}>
      {showLabel && label && (
        <label
          htmlFor={field.name}
          className='mb-1 block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      )}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <input
            type='file'
            id={field.name}
            name={field.name}
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                field.handleChange(files);
              }
            }}
            onBlur={field.handleBlur}
            className='hidden'
            {...props}
          />
          <Button
            type='button'
            variant='outline'
            onClick={() => document.getElementById(field.name)?.click()}
            className='w-full justify-start'
          >
            <Paperclip className='mr-2 h-4 w-4' />
            {values.length > 0
              ? `${values.length} arquivo(s) selecionado(s)`
              : placeholder}
          </Button>
        </div>
        {values.length > 0 && (
          <ul className='mt-2 space-y-1'>
            {values.map((file, index) => (
              <li
                key={index}
                className='flex items-center text-xs text-gray-600'
              >
                <Paperclip className='mr-1 h-3 w-3' />
                <span className='truncate'>{file.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!field.state.meta.isValid &&
      (field.state.meta.isBlurred || field.state.meta.isTouched) ? (
        <em className='mt-1 block text-xs text-red-500'>
          {field.state.meta.errors
            .map((error: any) =>
              typeof error === 'object' ? error.message : error
            )
            .join('; ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? (
        <em className='mt-1 text-xs text-blue-500'>Validating...</em>
      ) : null}
    </div>
  );
}

export function FormDropdownModal({
  field,
  label,
  placeholder,
  showLabel = true,
  className = '',
  options,
  onValueChange,
  onValueBlurParser,
  modal = false,
  ...props
}: {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  showLabel?: boolean;
  className?: string;
  options: { value: string | number; label: string }[];
  onValueChange?: (value: string) => void;
  onValueBlurParser?: (value: string) => any;
  modal?: boolean;
  [key: string]: any;
}) {
  const value = String(field.state.value);

  return (
    <div className={className}>
      {showLabel && label && (
        <label
          htmlFor={field.name}
          className='mb-1 block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      )}
      <Select
        value={value}
        onValueChange={(val) => {
          const finalValue = onValueBlurParser ? onValueBlurParser(val) : val;
          field.handleChange(finalValue);
          if (onValueChange) {
            onValueChange(finalValue);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            field.handleBlur();
          }
        }}
        {...props}
      >
        <SelectTriggerModal className='w-full'>
          <SelectValueModal placeholder={placeholder} />
        </SelectTriggerModal>
        <SelectContentModal>
          <SelectGroupModal>
            <SelectLabelModal>{label}</SelectLabelModal>
            {options.map((option) => (
              <SelectItemModal
                key={String(option.value)}
                value={String(option.value)}
              >
                {option.label}
              </SelectItemModal>
            ))}
          </SelectGroupModal>
        </SelectContentModal>
      </Select>
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

// Novo componente FormInputCheckbox
export function FormInputCheckbox({
  field,
  label,
  showLabel = true,
  className = '',
  ...props
}: {
  field: AnyFieldApi;
  label?: string;
  showLabel?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const checked = field.state.value as boolean;

  return (
    <div className={className}>
      <div className='flex items-center'>
        <input
          id={field.name}
          name={field.name}
          type='checkbox'
          checked={checked}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.checked)}
          className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500' // Estilo básico, ajuste conforme necessário
          {...props}
        />
        {showLabel && label && (
          <label
            htmlFor={field.name}
            className='ml-2 block text-sm font-medium text-gray-700'
          >
            {label}
          </label>
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

export function FormInputFieldSearch({
  field,
  label,
  type = 'text',
  placeholder,
  showLabel = true,
  className = '',
  onValueBlurParser,
  ...props
}: {
  field: AnyFieldApi;
  label?: string;
  type?: string;
  placeholder?: string;
  showLabel?: boolean;
  className?: string;
  onValueBlurParser?: (value: string) => any;
  [key: string]: any;
}) {
  // Como AnyFieldApi é genérico (any para muitos tipos internos),
  // você pode precisar de algumas asserções de tipo ao acessar propriedades
  // se o TypeScript não puder inferir o tipo específico que você espera.
  // No entanto, para propriedades comuns como 'name', 'state.value', 'handleChange', 'handleBlur',
  // e 'state.meta', geralmente funciona bem.

  const value = field.state.value as string; // Asserção para input de texto
  //   const errors = field.state.meta.errors as string[] | undefined; // Asserção para o formato esperado de erros

  return (
    <div className={className}>
      {showLabel && label && (
        <label
          htmlFor={field.name}
          className='mb-1 block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      )}
      <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
      <Input
        id={field.name}
        name={field.name}
        value={value}
        onBlur={(e) => {
          if (onValueBlurParser) {
            const parsedValue = onValueBlurParser(e.target.value);
            field.handleChange(parsedValue);
          }
          field.handleBlur();
        }}
        onChange={(e) => field.handleChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className='pl-8'
        {...props}
      />
      {/* Exibindo informações de erro e validação como no exemplo fornecido */}
      {/* {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? ( */}
      {!field.state.meta.isValid && field.state.meta.isBlurred ? (
        // Acessando field.state.meta.errors diretamente.
        // A biblioteca garante que errors é um array.
        // O exemplo original usava !field.state.meta.isValid, o que também é válido.
        // Usar errors.length > 0 é muitas vezes mais direto.
        <em className='mt-1 block text-xs text-red-500'>
          {/* Mapeia os erros para extrair apenas a propriedade 'message' e depois junta com vírgula */}
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

export function FormDatePicker({
  field,
  label,
  showLabel = true,
  className = '',
  formatDate = 'PPP',
  mode = 'single',
  ...props
}: {
  field: AnyFieldApi;
  label?: string;
  showLabel?: boolean;
  className?: string;
  formatDate?: string;
  mode?: 'single' | 'range';
  [key: string]: any;
}) {
  // O valor pode ser Date para modo 'single' ou DateRange para modo 'range'
  const value = field.state.value as Date | DateRange | undefined;
  const [open, setOpen] = useState(false);

  const selectedValue =
    mode === 'single'
      ? (value as Date | undefined)
      : (value as DateRange | undefined);

  return (
    <div className={className}>
      {showLabel && label && (
        <Label
          htmlFor={field.name}
          className='mb-1 block text-sm font-medium text-gray-700'
        >
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {mode === 'single' && value instanceof Date ? (
              format(value, formatDate, {
                locale: ptBR
              })
            ) : mode === 'range' &&
              (value as DateRange)?.from &&
              (value as DateRange)?.to ? (
              `${format((value as DateRange).from!, formatDate, {
                locale: ptBR
              })} - ${format((value as DateRange).to!, formatDate, {
                locale: ptBR
              })}`
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          {mode === 'single' ? (
            <Calendar
              mode='single'
              selected={selectedValue as Date | undefined}
              onSelect={(date: Date | undefined) => {
                field.handleChange(date);
                field.handleBlur();
                setOpen(false); // Sempre fecha no modo single
              }}
              locale={ptBR}
              initialFocus
            />
          ) : (
            <Calendar
              mode='range'
              selected={selectedValue as DateRange | undefined}
              onSelect={(date: DateRange | undefined) => {
                field.handleChange(date);
                field.handleBlur();
                // Fecha o Popover apenas se ambas as datas foram selecionadas no modo range
                if (date?.from && date?.to) {
                  setOpen(false);
                }
              }}
              locale={ptBR}
              initialFocus
              required={false} // Permite seleção de range parcial
            />
          )}
        </PopoverContent>
      </Popover>
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

export function FormInputTextArea({
  field,
  label,
  placeholder,
  showLabel = true,
  className = '',
  onValueBlurParser,
  ...props
}: {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  showLabel?: boolean;
  className?: string;
  onValueBlurParser?: (value: string) => any;
  [key: string]: any;
}) {
  const value = field.state.value as string;

  return (
    <div className={className}>
      {showLabel && label && (
        <label
          htmlFor={field.name}
          className='mb-1 block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      )}
      <Textarea
        id={field.name}
        name={field.name}
        value={value}
        onBlur={(e) => {
          if (onValueBlurParser) {
            const parsedValue = onValueBlurParser(e.target.value);
            field.handleChange(parsedValue);
          }
          field.handleBlur();
        }}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
      {!field.state.meta.isValid && field.state.meta.isBlurred ? (
        <em className='mt-1 block text-xs text-red-500'>
          {/* Mapeia os erros para extrair apenas a propriedade 'message' e depois junta com vírgula */}
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

export function FormCombobox({
  field,
  label,
  placeholder,
  showLabel = true,
  className = '',
  options,
  onValueChange,
  onValueBlurParser,
  emptyMessage,
  ...props
}: {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  showLabel?: boolean;
  className?: string;
  options: {
    value: string | number;
    label: string;
    secondaryLabel?: string | null;
  }[];
  onValueChange?: (value: string) => void;
  onValueBlurParser?: (value: string) => any;
  emptyMessage?: string;
  [key: string]: any;
}) {
  const value = String(field.state.value);

  return (
    <div className={className}>
      {showLabel && label && (
        <label
          htmlFor={field.name}
          className='mb-1 block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      )}
      <Combobox
        options={options.map((option) => ({
          value: String(option.value),
          label: option.label,
          secondaryLabel: option.secondaryLabel
        }))}
        value={value}
        onValueChange={(val) => {
          const finalValue = onValueBlurParser ? onValueBlurParser(val) : val;
          field.handleChange(finalValue);
          if (onValueChange) {
            onValueChange(finalValue);
          }
        }}
        placeholder={placeholder}
        emptyMessage={emptyMessage}
        className='w-full'
        {...props}
      />
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
