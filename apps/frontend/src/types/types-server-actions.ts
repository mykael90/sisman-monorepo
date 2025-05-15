export interface IActionResultForm<TData> {
  isSubmitSuccessful?: boolean;
  errorsServer?: string[]; // Erros globais de formulário gerados no lado do servidor
  errorsFieldsServer?: Partial<Record<keyof TData, string[]>>; //
  values?: Partial<TData>; // Para mergeForm atualizar valores se necessário
  createdData?: Partial<TData>;
  submittedData?: Partial<TData>; // Para mergeForm atualizar valores se necessário
  fieldMeta?: Partial<
    Record<
      keyof TData,
      {
        errors: string[];
      }
    >
  >;
  message: string;
}
