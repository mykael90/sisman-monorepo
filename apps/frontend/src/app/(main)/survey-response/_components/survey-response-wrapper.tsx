'use client';

import { useRouter } from 'next/navigation';
import SurveyResponseForm from './form/survey-response-form';
import { ISurveyWithRelations } from '@/app/(main)/survey/survey-types';
import { UserCheck, UserPlus } from 'lucide-react';
import FormAddHeader from '../../../../components/form-tanstack/form-add-header';
import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card'; // Importando Card para estilização

interface IUserRequestProps {
  onAccept: () => void;
  onCancel: () => void;
}

function UserRequest({ onAccept, onCancel }: IUserRequestProps) {
  return (
    <div className='mx-auto max-w-2xl'>
      <div className='p-6 py-14'>
        <h1 className='text-sisman-blue mb-4 text-center text-2xl font-bold dark:text-gray-100'>
          Topa participar de uma pesquisa rápida?
        </h1>
        <p className='mb-6 text-justify leading-relaxed text-gray-700 dark:text-gray-300'>
          Olá! Este protótipo de software faz parte de uma pesquisa de mestrado,
          que busca entender e contribuir com a atividade de manutenção nas
          instituições federais de ensino. Por isso, convido você a avaliar o
          SISMAN e compartilhar sua opinião sobre a interface, usabilidade,
          funcionalidades. A participação é voluntária, não há qualquer
          identificação individual, e as respostas serão analisadas de forma
          agregada, exclusivamente para fins acadêmicos. Sua contribuição é
          muito importante!
        </p>

        <div className='flex justify-end gap-2 pt-2'>
          <Button onClick={onCancel} variant='outline'>
            Depois...
          </Button>
          <Button onClick={onAccept}>Topo!</Button>
        </div>
      </div>
    </div>
  );
}

export default function SurveyResponseWrapper({
  survey,
  isInDialog = false
}: {
  survey: ISurveyWithRelations;
  isInDialog?: boolean;
}) {
  const router = useRouter();

  const [userWantResponse, setUserWantResponse] = useState(false);

  const handleCancel = () => {
    router.back();
  };

  const handleAccept = () => {
    setUserWantResponse(true);
  };

  return (
    <>
      {!userWantResponse && (
        <UserRequest onAccept={handleAccept} onCancel={handleCancel} />
      )}

      {userWantResponse && (
        <div>
          <FormAddHeader
            Icon={UserCheck}
            title={survey.title}
            subtitle={survey.description || ''}
          />
          <SurveyResponseForm
            survey={survey}
            onCancel={handleCancel}
            isInDialog={isInDialog}
          />
        </div>
      )}
    </>
  );
}
