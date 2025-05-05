// /lib/isMobile.ts
import { UAParser } from 'ua-parser-js';
import { headers } from 'next/headers';

export default async function isMobile(): Promise<boolean> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return result.device.type === 'mobile';
}
