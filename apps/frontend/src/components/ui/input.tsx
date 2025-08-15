import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

interface InputDebounceProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  inputValue: string;
  setInputValue: (value: string) => void;
  debounce?: number;
  // Aceita a ref através de uma prop nomeada
  imperativeRef?: React.Ref<InputDebounceRef | null>; // Use '?' se for opcional
}

// Interface para o que será exposto pela ref (inalterada)
export interface InputDebounceRef {
  clearInput: () => void;
}

function InputDebounce({
  inputValue,
  setInputValue,
  debounce = 500,
  className,
  type,
  imperativeRef, // Recebe a ref como prop nomeada
  ...props
}: InputDebounceProps) {
  const [internalValue, setInternalValue] = React.useState(inputValue);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // Use a prop 'imperativeRef' aqui
  React.useImperativeHandle(
    imperativeRef,
    () => ({
      clearInput: () => {
        setInternalValue('');
        // Opcional: considere se precisa limpar o timeout ou chamar setInputValue aqui
        // clearTimeout(timeoutRef.current);
        // setInputValue(''); // Provavelmente desnecessário, pai já faz
      }
    }),
    []
  ); // Adicione dependências se 'clearInput' depender de props/state

  const debouncedOnChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      // Atualiza o estado interno imediatamente para feedback visual
      setInternalValue(newValue);

      //Se tiver algum timer contando zera novamente em função de nova digitação
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        // Atualiza o estado do pai após o debounce
        setInputValue(newValue);
      }, debounce);
    },
    []
  );

  // useEffect para limpar o timeout na desmontagem (ainda necessário e válido)
  // Isso é para gerenciar um recurso (timer), não para sincronizar estado/props.
  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []); // Array vazio: roda apenas na montagem e desmontagem

  //   // Opcional: Sincronizar se inputValue mudar externamente (exceto via debounce)
  // // Considere cuidadosamente se isso é necessário com a abordagem da ref.
  // // Se o pai SÓ muda inputValue via setInputValue('') no clear, a ref basta.
  // React.useEffect(() => {
  //   // Apenas atualiza se o valor externo for diferente E não for resultado
  //   // da própria digitação que ainda está no debounce (lógica complexa).
  //   // Talvez seja mais simples confiar na ref para o clear.
  //    if (inputValue !== internalValue && document.activeElement !== (props.ref as any)?.current) {
  //       // Atualiza o valor interno APENAS se o input não estiver focado E
  //       // o valor externo (do pai) for diferente do interno.
  //       // Isso ajuda a evitar que a limpeza sobrescreva a digitação.
  //       // Essa lógica pode ficar complexa, a ref é mais direta para o clear.
  //       // Se você remover este useEffect, o `clearInput` via ref ainda funcionará.
  //       // A inicialização `useState(inputValue)` pega o valor inicial.
  //    }
  //    // Se decidir manter, ajuste as condições conforme necessário.
  //    // A condição atual `document.activeElement` é apenas um exemplo.
  // }, [inputValue /*, internalValue */]); // Cuidado com dependências aqui

  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      value={internalValue}
      onChange={debouncedOnChange}
      {...props}
    />
  );
}

export { Input, InputDebounce };
