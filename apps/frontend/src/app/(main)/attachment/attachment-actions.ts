'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import {
  fetchApiSisman,
  fetchApiSismanFile,
  SismanApiError
} from '@/lib/fetch/api-sisman';
import { IActionResultForm } from '@/types/types-server-actions';
import { IAttachment } from './attachment-types';

const PAGE_PATH = '/attachment';
const API_RELATIVE_PATH = '/attachment';
const logger = new Logger(`${PAGE_PATH}/attachment-actions`);

export async function getAttachments(query?: string): Promise<IAttachment[]> {
  logger.info(`(Server Action) getAttachments: Fetching attachments`);
  const url = query ? `${API_RELATIVE_PATH}?${query}` : API_RELATIVE_PATH;
  try {
    const accessTokenSisman = await getSismanAccessToken();
    const data = await fetchApiSisman(url, accessTokenSisman);
    logger.info(
      `(Server Action) getAttachments: ${data.length} attachments returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getAttachments: Error fetching attachments`,
      error
    );
    throw error;
  }
}

export async function getAttachment(id: string): Promise<IAttachment> {
  logger.info(`(Server Action) getAttachment: Fetching attachment ${id}`);
  try {
    const accessTokenSisman = await getSismanAccessToken();
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman
    );
    logger.info(`(Server Action) getAttachment: attachment ${id} returned`);
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getAttachment: Error fetching attachment ${id}`,
      error
    );
    throw error;
  }
}

export async function getAttachmentFileView(attachmentId: string) {
  logger.info(
    `(Server Action) getAttachmentFileView: Fetching file view for attachment ${attachmentId}`
  );
  try {
    const accessTokenSisman = await getSismanAccessToken();
    const fileResponse = await fetchApiSismanFile(
      `/file/${attachmentId}/view`,
      accessTokenSisman
    );
    logger.info(
      `(Server Action) getAttachmentFileView: File for attachment ${attachmentId} returned`
    );
    return fileResponse;
  } catch (error) {
    logger.error(
      `(Server Action) getAttachmentFileView: Error fetching file for attachment ${attachmentId}`,
      error
    );
    throw error;
  }
}

async function multipartFetch(
  endpoint: string,
  formData: FormData
): Promise<any> {
  const baseUrl = process.env.SISMAN_API_URL;
  const accessToken = await getSismanAccessToken();
  const fullUrl = `${baseUrl}${endpoint}`;

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
      // Content-Type is set automatically by browser with FormData
    },
    body: formData
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new SismanApiError('Failed to upload attachment', errorBody);
  }

  return response.json();
}

export async function createAttachment(
  _prevState: unknown,
  formData: FormData
): Promise<IActionResultForm<FormData, IAttachment>> {
  logger.info(
    `(Server Action) createAttachment: Attempt to add attachment`,
    formData.get('relatedId')
  );

  try {
    const responseData = await multipartFetch(API_RELATIVE_PATH, formData);

    revalidatePath(PAGE_PATH);
    revalidatePath(`/`); // revalidate root to show attachments in other pages

    return {
      isSubmitSuccessful: true,
      responseData,
      submittedData: formData,
      message: 'Anexo adicionado com sucesso!'
    };
  } catch (error) {
    logger.error(`(Server Action) createAttachment: Unexpected error`, error);
    if (error instanceof SismanApiError) {
      return {
        isSubmitSuccessful: false,
        errorsServer: [error.apiMessage],
        submittedData: formData,
        message: 'Erro na comunicação com a API.'
      };
    }
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: formData,
      message: 'Unexpected error'
    };
  }
}

export async function createAttachmentsBatch(
  _prevState: unknown,
  formData: FormData
): Promise<IActionResultForm<FormData, IAttachment[]>> {
  logger.info(
    `(Server Action) createAttachmentsBatch: Attempt to add attachments in batch`,
    formData.get('relatedId')
  );

  try {
    const responseData = await multipartFetch(
      `${API_RELATIVE_PATH}/batch`,
      formData
    );

    revalidatePath(PAGE_PATH);
    revalidatePath(`/`); // revalidate root to show attachments in other pages

    return {
      isSubmitSuccessful: true,
      responseData,
      submittedData: formData,
      message: 'Anexos adicionados com sucesso!'
    };
  } catch (error) {
    logger.error(
      `(Server Action) createAttachmentsBatch: Unexpected error`,
      error
    );
    if (error instanceof SismanApiError) {
      return {
        isSubmitSuccessful: false,
        errorsServer: [error.apiMessage],
        submittedData: formData,
        message: 'Erro na comunicação com a API.'
      };
    }
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: formData,
      message: 'Unexpected error'
    };
  }
}

export async function deleteAttachment(id: string) {
  logger.info(`(Server Action) deleteAttachment: Deleting attachment ${id}`);
  try {
    const accessToken = await getSismanAccessToken();
    await fetchApiSisman(`${API_RELATIVE_PATH}/${id}`, accessToken, {
      method: 'DELETE'
    });
    logger.info(
      `(Server Action) deleteAttachment: attachment ${id} deleted, revalidating ${PAGE_PATH}`
    );
    revalidatePath(PAGE_PATH);
    return {
      isSubmitSuccessful: true,
      message: 'Anexo excluído com sucesso!'
    };
  } catch (error) {
    logger.error(
      `(Server Action) deleteAttachment: Error deleting attachment ${id}`,
      error
    );
    if (error instanceof SismanApiError) {
      return {
        isSubmitSuccessful: false,
        message: error.apiMessage
      };
    }
    return {
      isSubmitSuccessful: false,
      message: 'Erro inesperado ao excluir o anexo.'
    };
  }
}

export async function getRefreshedAttachments() {
  logger.info(
    `(Server Action) getRefreshedAttachments: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedAttachments: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedAttachments: Error revalidating path`,
      error
    );
    throw error;
  }
}
