import React from 'react';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getSurvey } from '@/app/(main)/survey/survey-actions';
import { getSurveyResponses } from '@/app/(main)/survey-response/survey-response-actions';
import { SurveyStatsHeader } from '../../_components/survey-stats-header';
import { SurveyStatsCard } from '../../_components/survey-stats-card';

export default async function SurveyStatsPage({
  params
}: {
  params: { surveyId: string };
}) {
  const { surveyId } = params;

  const accessToken = await getSismanAccessToken();
  const survey = await getSurvey(accessToken, surveyId);
  const surveyResponses = await getSurveyResponses(
    accessToken,
    `surveyId=${surveyId}`
  );

  if (!survey) {
    return <div>Questionário não encontrado.</div>;
  }

  // Mapear questões por ID para fácil acesso
  const questionsMap = new Map(survey.questions.map((q) => [q.id, q]));

  interface QuestionStats {
    type: string;
    totalResponses: number; // Número de pessoas que responderam a esta questão
    options?: { [key: string]: { count: number; percentage: number } };
    ratings?: {
      individualRatings: {
        [key: string]: { count: number; percentage: number };
      };
      sumOfRatings: number;
      averageRating: number;
    };
    textResponses?: string[];
  }

  const aggregatedStats: { [key: string]: QuestionStats } = {};

  // 1. Inicializar estatísticas para cada questão
  survey.questions.forEach((question) => {
    aggregatedStats[question.id] = {
      type: question.type,
      totalResponses: 0
    };
    if (question.type === 'SINGLE' || question.type === 'MULTIPLE') {
      aggregatedStats[question.id].options = {};
      question.surveyQuestionOptions.forEach((option) => {
        if (aggregatedStats[question.id].options) {
          aggregatedStats[question.id].options![option.id] = {
            count: 0,
            percentage: 0
          };
        }
      });
    } else if (question.type === 'BOOLEAN') {
      aggregatedStats[question.id].options = {
        true: { count: 0, percentage: 0 },
        false: { count: 0, percentage: 0 }
      };
    } else if (question.type === 'RATING') {
      aggregatedStats[question.id].ratings = {
        individualRatings: {},
        sumOfRatings: 0,
        averageRating: 0
      };
      for (let i = 1; i <= 5; i++) {
        if (aggregatedStats[question.id].ratings) {
          aggregatedStats[question.id].ratings!.individualRatings[
            i.toString()
          ] = {
            count: 0,
            percentage: 0
          };
        }
      }
    } else if (question.type === 'TEXT') {
      aggregatedStats[question.id].textResponses = [];
    }
  });

  // 2. Processar as respostas
  surveyResponses.forEach((response) => {
    response.answers.forEach((answer) => {
      const question = questionsMap.get(answer.questionId);

      if (question) {
        const stats = aggregatedStats[question.id];

        // Incrementamos que "uma pessoa respondeu" a esta questão
        stats.totalResponses++;

        if (question.type === 'SINGLE' || question.type === 'MULTIPLE') {
          // CORREÇÃO AQUI:
          // Verificamos se existem opções e iteramos sobre TODAS elas.
          if (stats.options && answer.options && answer.options.length > 0) {
            answer.options.forEach((selectedOption) => {
              const chosenOptionId = selectedOption.optionId;
              // Verifica se a opção existe no mapa inicializado (segurança)
              if (stats.options && stats.options[chosenOptionId]) {
                stats.options[chosenOptionId].count++;
              }
            });
          }
        } else if (
          question.type === 'BOOLEAN' &&
          typeof answer.boolValue === 'boolean'
        ) {
          if (stats.options) {
            const booleanValue = answer.boolValue.toString();
            if (stats.options[booleanValue]) {
              stats.options[booleanValue].count++;
            }
          }
        } else if (
          question.type === 'RATING' &&
          typeof answer.intValue === 'number'
        ) {
          if (stats.ratings) {
            const ratingValue = answer.intValue.toString();
            if (stats.ratings.individualRatings[ratingValue]) {
              stats.ratings.individualRatings[ratingValue].count++;
            }
            stats.ratings.sumOfRatings += answer.intValue;
          }
        } else if (
          question.type === 'TEXT' &&
          typeof answer.stringValue === 'string'
        ) {
          if (stats.textResponses) {
            stats.textResponses.push(answer.stringValue);
          }
        }
      }
    });
  });

  // 3. Calcular percentagens e médias
  Object.keys(aggregatedStats).forEach((questionId) => {
    const stats = aggregatedStats[questionId];
    if (stats.totalResponses > 0) {
      if (stats.options) {
        Object.keys(stats.options).forEach((optionId) => {
          // Nota: Para MULTIPLE, a soma das porcentagens pode passar de 100%,
          // pois representa "% de usuários que selecionaram esta opção".
          stats.options![optionId].percentage =
            (stats.options![optionId].count / stats.totalResponses) * 100;
        });
      } else if (stats.ratings) {
        Object.keys(stats.ratings.individualRatings).forEach((ratingValue) => {
          stats.ratings!.individualRatings[ratingValue].percentage =
            (stats.ratings!.individualRatings[ratingValue].count /
              stats.totalResponses) *
            100;
        });
        stats.ratings.averageRating =
          stats.ratings.sumOfRatings / stats.totalResponses;
      }
    }
  });

  return (
    <div className='container mx-auto space-y-6 pb-6'>
      <SurveyStatsHeader
        title={survey.title}
        description={survey.description}
        numberOfEvaluations={surveyResponses.length}
      />

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {survey.questions.map((question) => (
          <SurveyStatsCard
            key={question.id}
            question={question}
            stats={aggregatedStats[question.id]}
          />
        ))}
      </div>
    </div>
  );
}
