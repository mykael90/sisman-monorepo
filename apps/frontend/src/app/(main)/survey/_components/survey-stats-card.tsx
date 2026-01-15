import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  StarRatingDistribution,
  StarRatingDisplay
} from './star-rating-display';

interface QuestionStats {
  type: string;
  totalResponses: number;
  options?: { [key: string]: { count: number; percentage: number } };
  ratings?: {
    individualRatings: { [key: string]: { count: number; percentage: number } };
    sumOfRatings: number;
    averageRating: number;
  };
  textResponses?: string[];
}

interface SurveyStatsCardProps {
  question: {
    id: string;
    text: string;
    type: string;
    order?: number;
    surveyQuestionOptions?: Array<{ id: string; label: string }>;
  };
  stats: QuestionStats;
}

export function SurveyStatsCard({ question, stats }: SurveyStatsCardProps) {
  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SINGLE: 'Escolha Única',
      MULTIPLE: 'Múltipla Escolha',
      BOOLEAN: 'Verdadeiro/Falso',
      RATING: 'Avaliação',
      TEXT: 'Texto Livre'
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div>
            {question.order !== undefined && (
              <Badge variant='default' className='bg-primary mb-1'>
                Q{question.order}
              </Badge>
            )}
            <div className='flex items-center gap-2'>
              <CardTitle className='text-md font-medium'>
                {question.text}
              </CardTitle>
            </div>
            <div className='mt-2 flex items-center gap-2'>
              <Badge variant='outline'>
                {getQuestionTypeLabel(question.type)}
              </Badge>
              {/* <span className='text-muted-foreground text-sm'>
                {stats.totalResponses} resposta
                {stats.totalResponses !== 1 ? 's' : ''}
              </span> */}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {stats.type === 'RATING' && stats.ratings && (
          <RatingStatsContent
            ratings={stats.ratings}
            totalResponses={stats.totalResponses}
          />
        )}

        {(stats.type === 'SINGLE' ||
          stats.type === 'MULTIPLE' ||
          stats.type === 'BOOLEAN') &&
          stats.options && (
            <OptionsStatsContent
              options={stats.options}
              totalResponses={stats.totalResponses}
              question={question}
            />
          )}

        {stats.type === 'TEXT' && stats.textResponses && (
          <TextStatsContent textResponses={stats.textResponses} />
        )}

        {((stats.type === 'TEXT' && stats.textResponses?.length === 0) ||
          (stats.type !== 'TEXT' && stats.totalResponses === 0)) && (
          <div className='text-muted-foreground py-8 text-center'>
            Nenhuma resposta para esta questão
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RatingStatsContent({
  ratings,
  totalResponses
}: {
  ratings: {
    individualRatings: { [key: string]: { count: number; percentage: number } };
    averageRating: number;
  };
  totalResponses: number;
}) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='font-medium'>Avaliação Média</h4>
          <div className='mt-2'>
            <StarRatingDisplay rating={ratings.averageRating} size='lg' />
          </div>
        </div>
        <div className='text-right'>
          <p className='text-2xl font-bold'>
            {ratings.averageRating.toFixed(2)}
          </p>
          <p className='text-muted-foreground text-sm'>de 5 estrelas</p>
        </div>
      </div>

      <StarRatingDistribution
        individualRatings={ratings.individualRatings}
        totalResponses={totalResponses}
        averageRating={ratings.averageRating}
      />
    </div>
  );
}

function OptionsStatsContent({
  options,
  totalResponses,
  question
}: {
  options: { [key: string]: { count: number; percentage: number } };
  totalResponses: number;
  question: SurveyStatsCardProps['question'];
}) {
  const optionKeys = Object.keys(options).sort();

  return (
    <div className='space-y-4'>
      {optionKeys.map((optionKey) => {
        const option = options[optionKey];
        const optionLabel =
          question.type === 'BOOLEAN'
            ? optionKey === 'true'
              ? 'Sim'
              : 'Não'
            : question.surveyQuestionOptions?.find(
                (opt) => opt.id === optionKey
              )?.label || `Opção ${optionKey}`;

        return (
          <div key={optionKey} className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{optionLabel}</span>
                <span className='text-muted-foreground text-sm'>
                  {option.count} ({option.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className='bg-muted h-2 w-full overflow-hidden rounded-full'>
              <div
                className='bg-primary h-full rounded-full'
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TextStatsContent({ textResponses }: { textResponses: string[] }) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h4 className='font-medium'>Respostas de Texto</h4>
        <Badge variant='secondary'>{textResponses.length} respostas</Badge>
      </div>
      <div className='space-y-3'>
        {textResponses.map((text, index) => (
          <div
            key={index}
            className='bg-muted/50 rounded-lg border p-4 text-sm'
          >
            <p className='text-muted-foreground'>Resposta {index + 1}</p>
            <p className='mt-1'>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
