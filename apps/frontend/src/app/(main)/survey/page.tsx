import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getSurveys } from './survey-actions';
import { SurveyListPage } from './_components/list/survey-list';
import Logger from '@/lib/logger';

const PAGE_PATH = '/survey';
const logger = new Logger(`${PAGE_PATH}/page`);

export default async function Page() {
  logger.info(`(Server Page) rendering`);
  const surveys = await getSurveys();
  logger.info(`(Server Page) ${surveys.length} surveys returned`);

  return <SurveyListPage initialSurveys={surveys} />;
}
