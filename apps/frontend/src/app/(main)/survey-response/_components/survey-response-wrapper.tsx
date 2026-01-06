'use client';

import { useRouter } from 'next/navigation';
import SurveyResponseForm from './form/survey-response-form';
import { ISurveyWithRelations } from '@/app/(main)/survey/survey-types';

export default function SurveyResponseWrapper({
  survey
}: {
  survey: ISurveyWithRelations;
}) {
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };

  return <SurveyResponseForm survey={survey} onCancel={handleCancel} />;
}
