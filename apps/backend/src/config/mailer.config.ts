import { MailerOptions } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'mailer',
  (): MailerOptions => ({
    transport: {
      host: process.env.MAILER_HOST,
      port: Number(process.env.MAILER_PORT) || 587,
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
      },
    },
    defaults: {
      from: `"Sisman Messenger" <${process.env.MAILER_USER}>`,
    },
    template: {
      dir: __dirname + '/../templates',
      adapter: new PugAdapter(),
      options: {
        strict: true,
      },
    },
  }),
);
