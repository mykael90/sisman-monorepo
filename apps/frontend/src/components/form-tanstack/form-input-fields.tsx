import { AnyFieldApi } from '@tanstack/react-form';
import { Input } from '../ui/input';

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
          className='mb-1 block text-sm font-medium text-gray-700'
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
