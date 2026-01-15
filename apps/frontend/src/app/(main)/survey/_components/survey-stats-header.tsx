import React from 'react';

interface SurveyStatsHeaderProps {
  title: string;
  numberOfEvaluations: number;
}

export function SurveyStatsHeader({
  title,
  numberOfEvaluations
}: SurveyStatsHeaderProps) {
  return (
    <div className='space-y-2'>
      <h1 className='text-3xl font-bold tracking-tight'>
        Estatísticas do Questionário: {title}
      </h1>
      <p className='text-muted-foreground'>
        Número de Avaliações: {numberOfEvaluations}
      </p>
    </div>
  );
}
