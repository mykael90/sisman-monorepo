import { Prisma } from '@sisman/prisma';

export type ISurveyWithRelations = Prisma.SurveyGetPayload<{
  include: {
    questions: {
      include: {
        surveyQuestionOptions: true;
      };
    };
    responses: {
      include: {
        answers: {
          include: {
            options: true;
          };
        };
      };
    };
  };
}>;

export interface ISurveyAdd extends Prisma.SurveyCreateManyInput {
  questions: ISurveyQuestion[];
}

export interface ISurveyQuestion extends Prisma.SurveyQuestionCreateManyInput {
  surveyQuestionOptions: ISurveyQuestionOption[];
}

export interface ISurveyQuestionOption
  extends Prisma.SurveyQuestionOptionsCreateManyInput {}

export interface ISurveyEdit extends ISurveyAdd {
  id: string;
}
