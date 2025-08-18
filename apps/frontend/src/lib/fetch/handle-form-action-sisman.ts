import { revalidatePath } from 'next/cache';
import { IActionResultForm } from '@/types/types-server-actions';
import { fetchApiSisman, SismanApiError } from './api-sisman';

import Logger from '@/lib/logger';

const logger = new Logger('handle-form-action-sisman');

/**
 * Lida com a lógica comum de submissão de formulário (adição/atualização).
 */
export async function handleApiAction<
  TValidatedData, // Tipo dos dados já validados para enviar à API
  TApiResponseData, // Tipo da resposta da API
  TSubmittedData = TValidatedData // Tipo dos dados originais do formulário (para submittedData em caso de erro)
>(
  validatedData: TValidatedData, // Recebe os dados já validados
  originalRawData: TSubmittedData, // Recebe os dados brutos originais para retorno em caso de erro
  apiConfig: {
    endpoint: string;
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH'; // Métodos comuns de escrita
    accessToken: string;
  },
  revalidationConfig: {
    mainPath: string;
    detailPath?: string; // Opcional, para revalidar uma página de detalhe
  },
  successMessage: string
): Promise<IActionResultForm<TSubmittedData, TApiResponseData>> {
  logger.info(
    `(Server Action) handleApiAction: Executando ação API para ${apiConfig.method} ${apiConfig.endpoint}.`
  );

  try {
    const responseDataFromApi = (await fetchApiSisman(
      apiConfig.endpoint,
      apiConfig.accessToken,
      {
        method: apiConfig.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      }
    )) as TApiResponseData;

    logger.info(
      `(Server Action) handleApiAction: Operação API bem-sucedida.`,
      responseDataFromApi
    );

    // Revalidação do Cache
    revalidatePath(revalidationConfig.mainPath);
    if (revalidationConfig.detailPath) {
      revalidatePath(revalidationConfig.detailPath);
    }
    logger.info(
      `(Server Action) handleApiAction: Cache revalidado para ${
        revalidationConfig.mainPath
      } ${
        revalidationConfig.detailPath
          ? `e ${revalidationConfig.detailPath}`
          : ''
      }.`
    );

    return {
      isSubmitSuccessful: true,
      responseData: responseDataFromApi,
      submittedData: originalRawData, // Retorna os dados brutos originais
      message: successMessage
    };
  } catch (error) {
    logger.error(
      `(Server Action) handleApiAction: Erro durante a operação API.`,
      error
    );
    if (error instanceof SismanApiError) {
      // Tratamento de erro da API (ex: 409 Conflito)
      if (error.statusCode === 409) {
        return {
          isSubmitSuccessful: false,
          errorsServer: [
            error.apiMessage || 'Conflito com registro existente.'
          ],
          submittedData: originalRawData,
          message: 'Conflito com registro existente.',
          statusCode: error.statusCode
        };
      }
      // Outros erros da API
      return {
        isSubmitSuccessful: false,
        errorsServer: [
          error.apiMessage ||
            'Ocorreu um erro ao comunicar com o servidor. Tente novamente.'
        ],
        submittedData: originalRawData,
        message: 'Erro na comunicação com a API.',
        statusCode: error.statusCode
      };
    }
    // Para erros inesperados não capturados pelo SismanApiError
    throw error;
  }
}
