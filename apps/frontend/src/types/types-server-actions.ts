export interface IActionResultForm<
  TSubmittedData,
  TApiResponse = Partial<TSubmittedData> // Permite resposta parcial
> {
  isSubmitSuccessful?: boolean;
  errorsServer?: string[];
  errorsFieldsServer?: Partial<Record<keyof TSubmittedData, string[]>>;
  responseData?: Partial<TApiResponse>;
  submittedData?: FormData | Partial<TSubmittedData>;
  message?: string;
}
