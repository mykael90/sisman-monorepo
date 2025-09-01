// /lib/isMobile.ts
import { UAParser } from 'ua-parser-js';
import { headers } from 'next/headers';

export default async function isMobile(): Promise<boolean> {
  // Uso de "dynamic function"
  // Quando usa essa função a página não pode ser armazenada a priori, uma vez que apenas com a requisição do usuário será possível saber
  // se o uso é através de mobile ou desktop
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return result.device.type === 'mobile';
}
