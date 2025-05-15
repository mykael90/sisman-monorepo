export interface IActionResultForm<TData> {
  isSubmitSuccessful?: boolean;
  errorsServer?: string[]; // Erros globais de formulário gerados no lado do servidor
  values?: Partial<TData>; // Para mergeForm atualizar valores se necessário
  createdData?: TData;
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
