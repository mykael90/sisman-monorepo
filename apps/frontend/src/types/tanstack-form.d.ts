import { FormState } from '@tanstack/react-form';

declare module '@tanstack/react-form' {
  //allows us to add custom properties for FormState
  interface FormState {
    errorsServer?: string[];
    errorsFieldsServer?: Record<string, string[]>;
    message?: string;
    createdData?: any;
    submittedData?: any;
  }
}
