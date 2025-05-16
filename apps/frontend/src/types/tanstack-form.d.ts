import { FormState, FieldMeta } from '@tanstack/react-form';

declare module '@tanstack/react-form' {
  //allows us to add custom properties for FormState
  interface FormState<
    TData = any,
    TMeta = any,
    TFormValidator = any,
    TFormOptions = any,
    TFormStore = any,
    TFormState = any,
    TFormApi = any,
    TFieldValues = any,
    TFieldMeta = any,
    TFieldError = any,
    TFieldValidator = any
  > {
    errorsServer?: string[];
    errorsFieldsServer?: Partial<Record<keyof TData, string[]>>;
    message?: string;
    createdData?: any;
    submittedData?: FormData | Partial<TData>;
  }
}
