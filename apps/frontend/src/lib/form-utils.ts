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
