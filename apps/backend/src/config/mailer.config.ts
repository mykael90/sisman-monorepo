import { registerAs } from '@nestjs/config';

interface MailerConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export default registerAs(
  'mailer',
  (): MailerConfig => ({
    host: process.env.MAILER_HOST,
    port: parseInt(process.env.MAILER_PORT, 10) || 465,
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS
  })
);
