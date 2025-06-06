import { registerAs } from '@nestjs/config';

interface SipacScrapingConfig {
  apiUrl: string;
  requestsPerHour: number;
}

export default registerAs(
  'sipacScraping',
  (): SipacScrapingConfig => ({
    apiUrl: process.env.SIPAC_SCRAPING_API_URL || 'http://localhost:3010', // Default to localhost:3001
    requestsPerHour:
      parseInt(process.env.SIPAC_SCRAPING_REQUESTS_PER_HOUR, 10) || 5000
  })
);
