'use server';

import { fetchApiSisman, SismanApiError } from '@/lib/fetch/api-sisman';
import formDataToObject from '@/lib/formdata-to-object';
import Logger from '@/lib/logger';
import { IActionResultForm } from '@/types/types-server-actions';

const PAGE_PATH = '/signin'; // Usar maiúsculas para constantes globais ao módulo

const RELATIVE_REQUEST_MAGIC_LINK = `/auth/magic-link/request`;

const logger = new Logger(`${PAGE_PATH}/signin-actions`);

export async function requestMagicLink(
  prevState: unknown,
  formData: FormData
): Promise<IActionResultForm<{ email: string }>> {
  const rawData = formDataToObject(formData);
  logger.info(`(Server Action) signin: Tentativa de enviar email.`, rawData);

  // 2. Chamar a ação genérica da API
  try {
    const responseDataFromApi = await fetchApiSisman(
      RELATIVE_REQUEST_MAGIC_LINK,
      undefined,
      {
        method: 'POST',
        body: JSON.stringify(rawData)
      }
    );

    return {
      isSubmitSuccessful: true,
      responseData: responseDataFromApi,
      submittedData: rawData, // Retorna os dados brutos originais
      message: 'Email enviado com sucesso'
    };
  } catch (error) {
    logger.error(
      `(Server Action) handleApiAction: Erro durante a operação API.`,
      error
    );
    if (error instanceof SismanApiError) {
      // erros da API
      return {
        isSubmitSuccessful: false,
        errorsServer: [
          error.apiMessage ||
            'Ocorreu um erro ao comunicar com o servidor. Tente novamente.'
        ],
        submittedData: rawData,
        message: 'Erro na comunicação com a API.'
      };
    }
    // Para erros inesperados não capturados pelo SismanApiError
    throw error;
  }
}
