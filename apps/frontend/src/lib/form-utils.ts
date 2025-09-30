import { FormApi } from '@tanstack/react-form';

/**
 * Generates a filtered payload containing only changed fields for update operations.
 * For 'add' mode, returns the full payload.
 *
 * @param mode - The form mode ('add' or 'edit').
 * @param values - The current form values.
 * @param defaultValues - The initial default values of the form.
 * @param formApi - The TanStack React Form API instance to access dirty fields.
 * @param idFieldName - The name of the ID field (e.g., 'id').
 * @returns The filtered payload for update or the full payload for add.
 */
export function getFilteredPayloadForUpdate<TFormValues extends object>(
  mode: 'add' | 'edit',
  values: TFormValues,
  defaultValues: TFormValues,
  formApi: any, // Temporarily set to any to resolve type error
  idFieldName: keyof TFormValues
): Partial<TFormValues> {
  if (mode === 'edit') {
    const changedData: Partial<TFormValues> = {};
    for (const fieldName in formApi.state.fieldMeta) {
      if (formApi.state.fieldMeta[fieldName].isDirty) {
        (changedData as any)[fieldName] = (values as any)[fieldName];
      }
    }
    // Ensure the ID field is always included for edit operations
    if (idFieldName && (defaultValues as any)[idFieldName] !== undefined) {
      (changedData as any)[idFieldName] = (defaultValues as any)[idFieldName];
    }
    return changedData;
  }
  return values; // For 'add' mode, return all values
}

type ReferenceObject = {
  [key: string]: any;
};

// Usa o tipo "infer" para criar um novo tipo com as chaves que existem em ambos os objetos
type Intersect<T, R> = Pick<T, keyof T & keyof R>;

export function removeUnreferencedKeys<
  T extends ReferenceObject,
  R extends ReferenceObject
>(objectToClean: T, referenceObject: R): Intersect<T, R> {
  const newObject = {} as Intersect<T, R>;

  for (const key in objectToClean) {
    if (Object.prototype.hasOwnProperty.call(referenceObject, key)) {
      newObject[key as keyof Intersect<T, R>] = objectToClean[key] as any;
    }
  }

  return newObject;
}

export function formatRequestNumber(req: string): string {
  const currentYear = new Date().getFullYear();

  if (req.length > 0) {
    if (req.includes('/')) {
      return req;
    } else {
      return `${req}/${currentYear}`;
    }
  }
  return '';
}

export function zodVerifyCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const val = cpf.replace(/\D/g, '');

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(val)) return false;

  let sum = 0;
  let remainder;

  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(val.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(val.substring(9, 10))) return false;

  // Segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(val.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(val.substring(10, 11))) return false;

  return true;
}
