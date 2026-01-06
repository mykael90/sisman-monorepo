import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import SurveyResponseForm from '../_components/form/survey-response-form';
import Logger from '@/lib/logger';
import { useRouter } from 'next/navigation';
import SurveyResponseWrapper from '../_components/survey-response-wrapper';
import { getSurvey } from '../../survey/survey-actions';

const PAGE_PATH = '/survey-response';
const logger = new Logger(`${PAGE_PATH}/page`);

export default async function Page({
  params
}: {
  params: { surveyId: string };
}) {
  logger.info(`(Server Page) rendering for survey ${params.surveyId}`);
  const accessToken = await getSismanAccessToken();
  const survey = await getSurvey(accessToken, params.surveyId);
  logger.info(`(Server Page) survey ${survey.id} returned`);

  return (
    <div className='container mx-auto p-4'>
      <SurveyResponseWrapper survey={survey} />
    </div>
  );
}
