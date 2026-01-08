'use client';

import { useRouter } from 'next/navigation';
import SurveyResponseForm from './form/survey-response-form';
import { ISurveyWithRelations } from '@/app/(main)/survey/survey-types';
import { UserCheck, UserPlus } from 'lucide-react';
import FormAddHeader from '../../../../components/form-tanstack/form-add-header';
import { useState } from 'react';
import { Button } from '../../../../components/ui/button';

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

  return (
    <>
      {!userWantResponse && (
        <div>
          <h1 className='mb-4 text-center text-2xl font-bold'>
            Você pode responder a esta pesquisa?
          </h1>
          <p>
            Olá, estou desenvolvendo uma pesquisa que tem como objetivo
            compreender como a atividade de manutenção é realizada nas
            instituições federais de ensino e validar, na prática, um protótipo
            de sistema de gestão de manutenção pensado especificamente para esse
            contexto; por isso, convido você a colaborar avaliando o software.
            Sua participação é voluntária e consiste apenas em utilizar o
            sistema e compartilhar sua percepção sobre funcionalidades,
            usabilidade e aderência à realidade do trabalho, sem qualquer
            identificação individual ou institucional. As informações coletadas
            serão analisadas de forma agregada, com garantia de sigilo e uso
            exclusivo para fins acadêmicos, podendo você desistir da
            participação a qualquer momento, sem qualquer prejuízo. Sua
            contribuição é fundamental para aprimorar a ferramenta e torná-la
            mais adequada às necessidades reais dos usuários.
          </p>
          <Button onClick={handleCancel} variant='ghost'>
            Cancelar
          </Button>
          <Button onClick={() => setUserWantResponse(true)}>Aceitar</Button>
        </div>
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
