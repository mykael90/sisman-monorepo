import { registerAs } from '@nestjs/config';

// Sipac API
interface SipacApiConfig {
  apiUrl: string;
  authBaseUrl: string;
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  tokenScope: string;
  xApiKey: string;
  requestsPerHour: number;
}

export default registerAs(
  'sipacApi',
  (): SipacApiConfig => ({
    apiUrl: process.env.UFRN_API_URL,
    authBaseUrl: process.env.UFRN_AUTH_BASE_URL,
    clientId: process.env.UFRN_CLIENT_ID,
    clientSecret: process.env.UFRN_CLIENT_SECRET,
    tokenUrl: process.env.UFRN_TOKEN_URL,
    tokenScope: process.env.UFRN_TOKEN_SCOPE || 'read',
    xApiKey: process.env.UFRN_XAPI_KEY,
    requestsPerHour: parseInt(process.env.UFRN_REQUESTS_PER_HOUR, 10) || 5000
  })
);
