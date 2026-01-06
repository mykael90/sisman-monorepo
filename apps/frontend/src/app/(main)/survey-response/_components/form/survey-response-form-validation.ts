import { z } from 'zod';
import { ISurveyWithRelations } from '../../../survey/survey-types';

export const createSurveyResponseSchema = (survey: ISurveyWithRelations) => {
  return z.object({
    surveyId: z.string(),
    answers: z
      .array(
        z.object({
          questionId: z.string(),
          value: z.any()
        })
      )
      .superRefine((answers, ctx) => {
        survey.questions.forEach((question) => {
          const answer = answers.find((a) => a.questionId === question.id);

          if (question.required) {
            const answerIsEmpty =
              !answer ||
              answer.value === undefined ||
              answer.value === null ||
              answer.value === '' ||
              (Array.isArray(answer.value) && answer.value.length === 0);

            if (answerIsEmpty) {
              const questionIndex = survey.questions.findIndex(
                (q) => q.id === question.id
              );
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Este campo é obrigatório.`,
                path: [questionIndex, 'value']
              });
            }
          }
        });
      })
  });
};
