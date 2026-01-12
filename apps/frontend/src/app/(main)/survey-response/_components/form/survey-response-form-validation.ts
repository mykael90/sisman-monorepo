import { z } from 'zod';
import { ISurveyWithRelations } from '../../../survey/survey-types';

export const createAnswerSchema = (
  question: ISurveyWithRelations['questions'][0]
) => {
  if (!question.required) {
    return z.any().optional();
  }

  switch (question.type) {
    case 'TEXT':
      return z
        .string({
          required_error: 'Este campo é obrigatório.'
        })
        .min(1, 'Este campo é obrigatório.');
    case 'RATING':
      return z.number({
        required_error: 'Este campo é obrigatório.',
        invalid_type_error: 'Selecione uma avaliação.'
      });
    case 'BOOLEAN':
      return z.boolean({
        required_error: 'Este campo é obrigatório.',
        invalid_type_error: 'Selecione uma opção.'
      });
    case 'SINGLE':
      return z.array(z.string()).min(1, 'Este campo é obrigatório.');
    case 'MULTIPLE':
      return z.array(z.string()).min(1, 'Selecione ao menos uma opção.');
    default:
      return z.any();
  }
};
