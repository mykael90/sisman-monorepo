export interface IActionResultForm<TData> {
  isSubmitSuccessful?: boolean;
  errorsServer?: string[];
  errorsFieldsServer?: Partial<Record<keyof TData, string[]>>; //
  createdData?: any;
  submittedData?: FormData | Partial<TData>;
  message?: string;
}
