import Modal from '@/components/ui/modal';
import SurveyResponsePage from '../../../survey-response/[surveyId]/page';

export default async function Page({
  params
}: {
  params: Promise<{ surveyId: string }>;
}) {
  return (
    <Modal>
      <SurveyResponsePage params={params} isInDialog={true} />
    </Modal>
  );
}
