import * as Joi from 'joi';

export const validationSchema = Joi.object({
  MAILER_HOST: Joi.string().hostname().required(),
  MAILER_PORT: Joi.number().default(587),
  MAILER_USER: Joi.string().required(),
  MAILER_PASS: Joi.string().required(),
});
