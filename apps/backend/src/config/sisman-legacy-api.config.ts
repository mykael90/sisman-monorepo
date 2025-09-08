import { registerAs } from '@nestjs/config';

// SismanLegacy API
interface SismanLegacyApiConfig {
  apiUrl: string;
  tokenUrl: string;
  username: string;
  password: string;
  requestsPerHour: number;
}

export default registerAs(
  'sismanLegacyApi',
  (): SismanLegacyApiConfig => ({
    apiUrl:
      process.env.SISMAN_LEGACY_API_URL || 'https://sisman.infra.ufrn.br:3002',
    tokenUrl:
      process.env.SISMAN_LEGACY_TOKEN_URL ||
      'https://sisman.infra.ufrn.br:3002/tokens',
    username: process.env.SISMAN_LEGACY_USERNAME || 'sisman',
    password: process.env.SISMAN_LEGACY_PASSWORD || 'sisman',
    requestsPerHour:
      parseInt(process.env.SISMAN_LEGACY_REQUESTS_PER_HOUR || '10000', 10) ||
      10000
  })
);
