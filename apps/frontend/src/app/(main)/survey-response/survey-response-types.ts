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
