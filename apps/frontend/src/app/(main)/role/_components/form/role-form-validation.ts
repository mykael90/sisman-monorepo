import { z, ZodError, ZodSchema } from 'zod';
import { IActionResultForm } from '../../../../../types/types-server-actions';
import { IRoleAdd, IRoleEdit } from '../../role-types';

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

// Schema Zod para adicionar Role
export const roleFormSchemaAdd = z.object({
  role: z
    .string()
    .min(3, 'O nome do papel deve ter pelo menos 3 caracteres')
    .regex(
      /^[A-Z_]+$/,
      'O nome do papel deve conter apenas letras maiúsculas e underscores (ex: ADMIN_USER)'
    ),
  description: z.string().optional().or(z.literal(''))
});

// Schema Zod para editar Role (geralmente inclui o ID e os mesmos campos)
export const roleFormSchemaEdit = roleFormSchemaAdd.extend({
  id: z.coerce.number().positive('ID inválido')
});

export function validateRoleFormData<TInputData extends IRoleAdd | IRoleEdit>(
  rawData: TInputData,
  schema: ZodSchema<TInputData>
): ValidationProcessResult<TInputData> {
  const validationParseResult = schema.safeParse(rawData);

  if (!validationParseResult.success) {
    const errorsFieldsServer = formatValidationErrors<TInputData>(
      validationParseResult.error
    );
    return {
      success: false,
      errorResult: {
        isSubmitSuccessful: false,
        errorsFieldsServer,
        message: 'Falha na validação dos dados. Verifique os campos marcados.',
        submittedData: rawData
      }
    };
  }

  return {
    success: true,
    data: validationParseResult.data
  };
}

function formatValidationErrors<TData>(validationError: ZodError<TData>) {
  return validationError.flatten().fieldErrors as Partial<
    Record<keyof TData, string[]>
  >;
}
