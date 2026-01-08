'use client';

import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import Image from 'next/image';
import HeroImage from '@/assets/img/hero-image.jpg';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ISurveyWithRelations } from '../../../app/(main)/survey/survey-types';
import { getSurveys } from '../../../app/(main)/survey/survey-actions';

export default function HeroBanner() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');

  // 1. USE O HOOK useQuery PARA BUSCAR E GERENCIAR OS DADOS
  const {
    data: listSurveys,
    isLoading: isLoadingSurvey, // Estado de carregamento, gerenciado para você
    isError: isErrorListSurvey, // Estado de erro, gerenciado para você
    error: errorListSurvey // O objeto de erro, se houver
  } = useQuery<ISurveyWithRelations[], unknown>({
    // 2. Chave da Query: um array que identifica unicamente esta busca.
    //    Quando 'warehouse.id' mudar, o TanStack Query refaz a busca automaticamente!
    queryKey: ['listSurveys'],

    // 3. Função da Query: a função assíncrona que retorna os dados.
    queryFn: () => getSurveys('showModal=true'),

    // 4. Habilitar/Desabilitar: A busca só será executada se 'warehouse' existir.
    //    Isso é crucial e muito mais limpo que um 'if' dentro do useEffect.
    // enabled: !!warehouse

    // 5. Roda só no mount
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false // opcional, evita novas tentativas automáticas
  });

  const surveyDisplayed = listSurveys?.find(
    (survey) => survey.showModal === true
  );

  // 2. Mover a lógica de navegação para o useEffect
  useEffect(() => {
    if (surveyDisplayed?.id) {
      router.push(`survey-response/${surveyDisplayed.id}`);
    }
  }, [surveyDisplayed?.id, router]);

  // 3. Retornar null (ou um loading) enquanto redireciona para evitar flash de conteúdo
  // if (true) {
  //   return null;
  // }

  return (
    <div
      className='relative h-100 bg-cover bg-center text-white'
      style={{
        backgroundImage: 'url(/placeholder.svg?height=400&width=1200)'
      }}
    >
      <Image
        src={HeroImage}
        alt='Hero Image'
        fill
        className='absolute inset-0 object-cover'
        priority
        quality={100}
      />

      <div className='relative z-10 flex h-full flex-col justify-center p-8'>
        <h1 className='mb-2 text-4xl font-bold'>Cuidando dos seus espaços</h1>
        <p className='mb-8 max-w-xl text-lg'>
          Simplifique a manutenção das suas instalações com este sistema
          informatizado de gerenciamento de manutenção.
        </p>
        <div className='flex gap-3'>
          <Button
            className='bg-sisman-green/80 hover:bg-sisman-green cursor-pointer'
            // onClick={() =>
            //   router.push(
            //     'survey-response/57170fad-4ebc-4c23-99a5-d2d4d95fd014'
            //   )
            // }
          >
            <Plus className='mr-2 h-4 w-4' /> Nova ocorrência
          </Button>
          <Button
            variant='ghost'
            className='cursor-pointer bg-gray-700 hover:bg-gray-500'
          >
            <FileText className='mr-2 h-4 w-4' /> Guia de ocorrências
          </Button>
        </div>
      </div>
    </div>
  );
}
