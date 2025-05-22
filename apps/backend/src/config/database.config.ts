import { registerAs } from '@nestjs/config';

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  schema: string;
  url: string;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    schema: process.env.DB_SCHEMA,
    url: process.env.DB_URL
  })
);
