import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import Logger from '@/lib/logger';
import SurveyResponseWrapper from '../_components/survey-response-wrapper';
import { getSurvey } from '../../survey/survey-actions';

const PAGE_PATH = '/survey-response';
const logger = new Logger(`${PAGE_PATH}/page`);

export default async function SurveyResponsePage({
  params,
  isInDialog = false
}: {
  params: Promise<{ surveyId: string }>;
  isInDialog?: boolean;
}) {
  const { surveyId } = await params;
  logger.info(`(Server Page) rendering for survey ${surveyId}`);
  const accessToken = await getSismanAccessToken();
  const survey = await getSurvey(accessToken, surveyId);
  logger.info(`(Server Page) survey ${survey.id} returned`);

  return (
    <div>
      <SurveyResponseWrapper survey={survey} isInDialog={isInDialog} />
    </div>
  );
}
