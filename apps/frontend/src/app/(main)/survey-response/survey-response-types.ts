import { Prisma } from '@sisman/prisma';

export type ISurveyResponseWithRelations = Prisma.SurveyResponseGetPayload<{
  include: {
    answers: {
      include: {
        options: true;
      };
    };
  };
}>;

export interface ISurveyResponseAdd
  extends Prisma.SurveyResponseCreateManyInput {
  answers: ISurveyAnswerAdd[];
}

export interface ISurveyAnswerAdd
  extends Prisma.SurveyAnswerCreateManyResponseInput {
  value: any;
}
