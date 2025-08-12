import { AnyFieldApi } from '@tanstack/react-form';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
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

// Componente FormInputField usando AnyFieldApi
export function FormInputField({
  field,
  label,
  type = 'text',
  placeholder,
  showLabel = true,
  className = '',
  ...props
}: {
  field: AnyFieldApi;
  label: string;
  type?: string;
  placeholder?: string;
  showLabel?: boolean;
  className?: string;
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
      {showLabel && (
        <label
          htmlFor={field.name}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <Input
        id={field.name}
        name={field.name}
        value={value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
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
        <em className="mt-1 block text-xs text-red-500">
          {/* Mapeia os erros para extrair apenas a propriedade 'message' e depois junta com vírgula */}
          {field.state.meta.errors
            .map((error: any) => error.message)
            .join('; ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? (
        <em className="mt-1 text-xs text-blue-500">Validating...</em>
      ) : null}
    </div>
  );
}

export function FormDropdown({
  field,
  label,
  placeholder,
  showLabel = true,
  className = '',
  options,
  onValueChange,
  ...props
}: {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  showLabel?: boolean;
  className?: string;
  options: { value: string | number; label: string }[];
  onValueChange?: (value: string) => void;
  [key: string]: any;
}) {
  const value = String(field.state.value);

  return (
    <div className={className}>
      {showLabel && (
        <label
          htmlFor={field.name}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <Select
        value={value}
        onValueChange={(val) => {
          field.handleChange(val);
          if (onValueChange) {
            onValueChange(val);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            field.handleBlur();
          }
        }}
        {...props}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
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
        <em className="mt-1 block text-xs text-red-500">
          {field.state.meta.errors
            .map((error: any) => error.message)
            .join('; ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? (
        <em className="mt-1 text-xs text-blue-500">Validating...</em>
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
  label: string;
  showLabel?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const checked = field.state.value as boolean;

  return (
    <div className={className}>
      <div className="flex items-center">
        <input
          id={field.name}
          name={field.name}
          type="checkbox"
          checked={checked}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" // Estilo básico, ajuste conforme necessário
          {...props}
        />
        {showLabel && (
          <label
            htmlFor={field.name}
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
      </div>
      {!field.state.meta.isValid && field.state.meta.isBlurred ? (
        <em className="mt-1 block text-xs text-red-500">
          {field.state.meta.errors
            .map((error: any) => error.message)
            .join('; ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? (
        <em className="mt-1 text-xs text-blue-500">Validating...</em>
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
  ...props
}: {
  field: AnyFieldApi;
  label: string;
  type?: string;
  placeholder?: string;
  showLabel?: boolean;
  className?: string;
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
      {showLabel && (
        <label
          htmlFor={field.name}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
      <Input
        id={field.name}
        name={field.name}
        value={value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="pl-8"
        {...props}
      />
      {/* Exibindo informações de erro e validação como no exemplo fornecido */}
      {/* {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? ( */}
      {!field.state.meta.isValid && field.state.meta.isBlurred ? (
        // Acessando field.state.meta.errors diretamente.
        // A biblioteca garante que errors é um array.
        // O exemplo original usava !field.state.meta.isValid, o que também é válido.
        // Usar errors.length > 0 é muitas vezes mais direto.
        <em className="mt-1 block text-xs text-red-500">
          {/* Mapeia os erros para extrair apenas a propriedade 'message' e depois junta com vírgula */}
          {field.state.meta.errors
            .map((error: any) => error.message)
            .join('; ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? (
        <em className="mt-1 text-xs text-blue-500">Validating...</em>
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
  ...props
}: {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  showLabel?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const value = field.state.value as string;

  return (
    <div className={className}>
      {showLabel && (
        <label
          htmlFor={field.name}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <Textarea
        id={field.name}
        name={field.name}
        value={value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
      {!field.state.meta.isValid && field.state.meta.isBlurred ? (
        <em className="mt-1 block text-xs text-red-500">
          {field.state.meta.errors
            .map((error: any) => error.message)
            .join('; ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? (
        <em className="mt-1 text-xs text-blue-500">Validating...</em>
      ) : null}
    </div>
  );
}