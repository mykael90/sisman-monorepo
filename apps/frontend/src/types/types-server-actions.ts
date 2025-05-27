export interface IActionResultForm<
  TSubmittedData,
  TApiResponse = Partial<TSubmittedData>
> {
  isSubmitSuccessful?: boolean;
  errorsServer?: string[];
  errorsFieldsServer?: Partial<Record<keyof TSubmittedData, string[]>>;
  responseData?: Partial<TApiResponse>;
  // Changed from: submittedData?: FormData | Partial<TSubmittedData>;
  submittedData?: Partial<TSubmittedData>; // Or Partial<TSubmittedData> if it can indeed be partial
  message?: string;
}

export interface IActionResultFormData<
  TSubmittedData,
  TApiResponse = Partial<TSubmittedData> // Permite resposta parcial
> {
  isSubmitSuccessful?: boolean;
  errorsServer?: string[];
  errorsFieldsServer?: Partial<Record<keyof TSubmittedData, string[]>>;
  responseData?: Partial<TApiResponse>;
  submittedData?: FormData;
  message?: string;
}
