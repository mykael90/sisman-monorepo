'use server';

import Logger from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { getSismanAccessToken } from '../../../../lib/auth/get-access-token';
import { fetchApiSisman } from '../../../../lib/fetch/api-sisman';
import { IActionResultForm } from '../../../../types/types-server-actions';
import { ITimelineEventAdd, ITimelineEventEdit } from './timeline-event-types';
import { handleApiAction } from '../../../../lib/fetch/handle-form-action-sisman';

const PAGE_PATH = '/maintenance/timeline-event';
const API_RELATIVE_PATH = '/maintenance/timeline-event';

const logger = new Logger(`${PAGE_PATH}/timeline-event-actions`);

export async function getTimelineEvents(accessTokenSisman: string) {
  logger.info(`(Server Action) getTimelineEvents: Fetching timeline-events`);
  try {
    const data = await fetchApiSisman(API_RELATIVE_PATH, accessTokenSisman, {
      cache: 'force-cache'
    });
    logger.info(
      `(Server Action) getTimelineEvents: ${data.length} timeline-events returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) getTimelineEvents: Error fetching timeline-events`,
      error
    );
    throw error;
  }
}

export async function showTimelineEvent(accessTokenSisman: string, id: number) {
  logger.info(
    `(Server Action) showTimelineEvent: Fetching timeline-event ${id}`
  );
  try {
    const data = await fetchApiSisman(
      `${API_RELATIVE_PATH}/${id}`,
      accessTokenSisman,
      { cache: 'force-cache' }
    );
    logger.info(
      `(Server Action) showTimelineEvent: timeline-event ${id} returned`
    );
    return data;
  } catch (error) {
    logger.error(
      `(Server Action) showTimelineEvent: Error fetching timeline-event ${id}`,
      error
    );
    throw error;
  }
}

export async function getRefreshedTimelineEvents() {
  logger.info(
    `(Server Action) getRefreshedTimelineEvents: Revalidating ${PAGE_PATH}`
  );
  try {
    revalidatePath(PAGE_PATH);
    logger.info(
      `(Server Action) getRefreshedTimelineEvents: Path ${PAGE_PATH} revalidated`
    );
    return true;
  } catch (error) {
    logger.error(
      `(Server Action) getRefreshedTimelineEvents: Error revalidating path`,
      error
    );
  }
}

export async function addTimelineEvent(
  prevState: unknown,
  data: ITimelineEventAdd
): Promise<IActionResultForm<ITimelineEventAdd, any>> {
  logger.info(
    `(Server Action) addTimelineEvent: Attempt to add timeline-event`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ITimelineEventAdd, any, ITimelineEventAdd>(
      data,
      data,
      {
        endpoint: API_RELATIVE_PATH,
        method: 'POST',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH
      },
      'TimelineEvent added successfully!'
    );
  } catch (error) {
    logger.error(`(Server Action) addTimelineEvent: Unexpected error`, error);
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}

export async function updateTimelineEvent(
  prevState: unknown,
  data: ITimelineEventEdit
): Promise<IActionResultForm<ITimelineEventEdit, any>> {
  logger.info(
    `(Server Action) updateTimelineEvent: Attempt to update timeline-event ${data.id}`,
    data
  );

  try {
    const accessToken = await getSismanAccessToken();
    return await handleApiAction<ITimelineEventEdit, any, ITimelineEventEdit>(
      data,
      data,
      {
        endpoint: `${API_RELATIVE_PATH}/${data.id}`,
        method: 'PUT',
        accessToken: accessToken
      },
      {
        mainPath: PAGE_PATH,
        detailPath: `${PAGE_PATH}/edit/${data.id}`
      },
      'TimelineEvent updated successfully!'
    );
  } catch (error) {
    logger.error(
      `(Server Action) updateTimelineEvent: Error updating timeline-event ${data.id}`,
      error
    );
    return {
      isSubmitSuccessful: false,
      errorsServer: ['An unexpected error occurred'],
      submittedData: data,
      message: 'Unexpected error'
    };
  }
}
