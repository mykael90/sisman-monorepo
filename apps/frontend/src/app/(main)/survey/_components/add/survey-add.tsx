'use client';

import { FilePlus } from 'lucide-react';
import FormAddHeader from '@/components/form-tanstack/form-add-header';
import SurveyForm from '../form/survey-form';
import { useRouter } from 'next/navigation';

export default function SurveyAdd() {
  const router = useRouter();
  const redirect = () => {
    router.push('/survey');
  };

  return (
    <div className='mx-auto w-full rounded-lg bg-white shadow-lg'>
      <FormAddHeader
        Icon={FilePlus}
        title='Nova Pesquisa'
        subtitle='Adicionar uma nova pesquisa no sistema'
      ></FormAddHeader>

      <SurveyForm onCancel={redirect} />
    </div>
  );
}
