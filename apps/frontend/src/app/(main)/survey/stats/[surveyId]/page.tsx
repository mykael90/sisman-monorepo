import React from 'react';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getSurvey } from '@/app/(main)/survey/survey-actions';
import { getSurveyResponses } from '@/app/(main)/survey-response/survey-response-actions';

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
    totalResponses: number;
    options?: { [key: string]: { count: number; percentage: number } };
    ratings?: {
      individualRatings: {
        [key: string]: { count: number; percentage: number };
      }; // Stores 1, 2, 3, 4, 5 ratings
      sumOfRatings: number;
      averageRating: number;
    };
    textResponses?: string[];
  }

  const aggregatedStats: { [key: string]: QuestionStats } = {};

  // Inicializar estatísticas para cada questão
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
      // For boolean, explicitly add 'true' and 'false' as options
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
        // Assumindo rating de 1 a 5
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

  // Processar as respostas
  surveyResponses.forEach((response) => {
    response.answers.forEach((answer) => {
      const question = questionsMap.get(answer.questionId);
      if (question) {
        const stats = aggregatedStats[question.id];
        stats.totalResponses++;

        if (question.type === 'SINGLE' || question.type === 'MULTIPLE') {
          if (stats.options && answer.options && answer.options.length > 0) {
            // For these types, the chosen option is in answer.options[0].optionId
            const chosenOptionId = answer.options[0].optionId;
            if (stats.options[chosenOptionId]) {
              stats.options[chosenOptionId].count++;
            }
          }
        } else if (
          question.type === 'BOOLEAN' &&
          typeof answer.boolValue === 'boolean'
        ) {
          if (stats.options) {
            const booleanValue = answer.boolValue.toString(); // 'true' or 'false'
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

  // Calcular percentagens e médias
  Object.keys(aggregatedStats).forEach((questionId) => {
    const stats = aggregatedStats[questionId];
    if (stats.totalResponses > 0) {
      if (stats.options) {
        Object.keys(stats.options).forEach((optionId) => {
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
    <div>
      <h1>Estatísticas do Questionário: {survey?.title}</h1>
      <h2>Número de Avaliações: {surveyResponses.length}</h2>
      <div className='space-y-8'>
        {survey.questions.map((question) => (
          <div key={question.id} className='rounded-lg border p-4 shadow-sm'>
            <h2 className='mb-2 text-xl font-semibold'>
              {question.text} ({question.type})
            </h2>
            {aggregatedStats[question.id] && (
              <div>
                {aggregatedStats[question.id].type === 'RATING' &&
                  aggregatedStats[question.id].ratings && (
                    <div>
                      <p className='font-medium'>
                        Média:{' '}
                        {aggregatedStats[
                          question.id
                        ].ratings!.averageRating.toFixed(2)}
                      </p>
                      <ul className='mt-2 list-disc pl-5'>
                        {Object.keys(
                          aggregatedStats[question.id].ratings!
                            .individualRatings
                        ).map((key) => {
                          const rating =
                            aggregatedStats[question.id].ratings!
                              .individualRatings[key];
                          return (
                            <li key={key}>
                              Rating {key}: {rating.count} escolhas (
                              {rating.percentage.toFixed(2)}%)
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                {(aggregatedStats[question.id].type === 'SINGLE' ||
                  aggregatedStats[question.id].type === 'MULTIPLE' ||
                  aggregatedStats[question.id].type === 'BOOLEAN') &&
                  aggregatedStats[question.id].options && (
                    <div>
                      <ul className='mt-2 list-disc pl-5'>
                        {Object.keys(aggregatedStats[question.id].options!).map(
                          (optionKey) => {
                            const option =
                              aggregatedStats[question.id].options![optionKey];
                            // For BOOLEAN, optionKey will be 'true' or 'false'
                            // For SINGLE/MULTIPLE, optionKey will be option.id
                            const optionLabel =
                              question.type === 'BOOLEAN'
                                ? optionKey === 'true'
                                  ? 'Verdadeiro'
                                  : 'Falso'
                                : question.surveyQuestionOptions.find(
                                    (opt) => opt.id === optionKey
                                  )?.label || `Opção ${optionKey}`;

                            return (
                              <li key={optionKey}>
                                {optionLabel}: {option.count} escolhas (
                                {option.percentage.toFixed(2)}%)
                              </li>
                            );
                          }
                        )}
                      </ul>
                    </div>
                  )}

                {aggregatedStats[question.id].type === 'TEXT' &&
                  aggregatedStats[question.id].textResponses &&
                  aggregatedStats[question.id].textResponses!.length > 0 && (
                    <div>
                      <h3 className='mt-2 font-medium'>Respostas de Texto:</h3>
                      <ul className='mt-2 list-disc pl-5'>
                        {aggregatedStats[question.id].textResponses!.map(
                          (text, index) => (
                            <li key={index}>{text}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {((aggregatedStats[question.id].type === 'TEXT' &&
                  aggregatedStats[question.id].textResponses &&
                  aggregatedStats[question.id].textResponses!.length === 0) ||
                  (aggregatedStats[question.id].type !== 'TEXT' &&
                    aggregatedStats[question.id].totalResponses === 0)) && (
                  <p>Nenhuma resposta para esta questão.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
