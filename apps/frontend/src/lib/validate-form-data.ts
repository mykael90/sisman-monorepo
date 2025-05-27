import { ZodError, ZodSchema } from 'zod';
import { IActionResultForm } from '../types/types-server-actions';

// Tipos para o resultado da validação
interface ValidationSuccess<TData> {
  success: true;
  data: TData; // Dados validados
}

interface ValidationFailure<TSubmittedData, TApiResponse = TSubmittedData> {
  success: false;
  // O resultado do erro já no formato esperado por IActionResultForm
  errorResult: IActionResultForm<TSubmittedData, TApiResponse>;
}

// União Discriminada para o resultado da validação
type ValidationProcessResult<TSubmittedData, TApiResponse = TSubmittedData> =
  | ValidationSuccess<TSubmittedData>
  | ValidationFailure<TSubmittedData, TApiResponse>;

export function validateFormData<TInputData>(
  rawData: TInputData,
  schema: ZodSchema<TInputData> // Espera um schema Zod para TInputData
): ValidationProcessResult<TInputData> {
  // O TApiResponse não é relevante aqui, então usamos o default
  const validationParseResult = schema.safeParse(rawData);

  if (!validationParseResult.success) {
    const errorsFieldsServer = formatValidationErrors<TInputData>(
      validationParseResult.error // ZodError tipado
    );
    return {
      success: false,
      errorResult: {
        // Retorna o objeto IActionResultForm pronto para erro de validação
        isSubmitSuccessful: false,
        errorsFieldsServer,
        message: 'Falha na validação dos dados. Verifique os campos marcados.',
        submittedData: rawData,
        responseData: undefined
      }
    };
  }

  return {
    success: true,
    data: validationParseResult.data // Dados validados
  };
}

// --- Funções Auxiliares para Ações de Formulário ---

/**
 * Formata os erros de validação do Zod para o formato esperado pela IActionResultForm.
 */
function formatValidationErrors<TData>(
  validationError: ZodError<TData>
): Partial<Record<keyof TData, string[]>> {
  const errorsFieldsServer: Partial<Record<keyof TData, string[]>> = {};
  validationError.issues.forEach((issue) => {
    const pathKey = issue.path.join('.') as keyof TData;
    if (!errorsFieldsServer[pathKey]) {
      errorsFieldsServer[pathKey] = [];
    }
    errorsFieldsServer[pathKey]!.push(issue.message);
  });
  return errorsFieldsServer;
}
