import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/_options'; // Ajuste o caminho se necessário
import Logger from '@/lib/logger';

const logger = new Logger('ApiUFRNUserSession');

// Defina uma interface mais específica para sua sessão, se possível.
// O local exato do accessToken depende das suas callbacks `jwt` e `session` em authOptions.
interface UserSession extends Session {
  // Exemplo: ajuste conforme a estrutura real da sua sessão
  accessTokenUfrn?: string;
  // ou talvez:
  // user?: {
  //   accessToken?: string;
  //   [key: string]: any;
  // } & DefaultSession['user'];
}

/**
 * Busca dados da API UFRN utilizando o token de acesso da sessão do usuário autenticado.
 *
 * Esta função deve ser usada em Server Components, Route Handlers ou `getServerSideProps`
 * onde `getServerSession` pode ser chamado.
 *
 * @param url - A URL da API UFRN para buscar os dados.
 * @param options - Opções de inicialização da requisição (RequestInit), opcionais.
 * @returns Uma Promise que resolve com o objeto Response do fetch.
 * @throws Lança um erro se o usuário não estiver autenticado, se variáveis de ambiente
 *         necessárias estiverem faltando, ou se a requisição fetch falhar.
 */
export default async function fetchApiUFRNUserSession(
  relativeUrl: string,
  options: RequestInit = {}
): Promise<Response> {
  // 1. Obter a sessão do usuário
  // A asserção de tipo `as UserSession | null` pode ser necessária dependendo da sua configuração.
  const session = (await getServerSession(authOptions)) as UserSession | null;

  if (!session) {
    logger.error(
      'fetchApiUFRNUserSession: Nenhuma sessão de usuário ativa encontrada.'
    );
    // Lançar um erro para ser tratado pelo chamador (ex: redirecionar para login)
    throw new Error('Usuário não autenticado.');
  }

  // 2. Extrair o token de acesso
  // Ajuste 'accessToken' com base na estrutura real da sua sessão em `authOptions`
  const userAccessToken = session.accessTokenUfrn;

  if (!userAccessToken) {
    logger.error(
      'fetchApiUFRNUserSession: Token de acesso não encontrado na sessão do usuário.'
    );
    throw new Error('Token de acesso do usuário não encontrado na sessão.');
  }

  // 3. Obter a Chave da API (X-API-Key)
  const apiKey = process.env.UFRN_XAPI_KEY;
  if (!apiKey) {
    logger.error(
      'fetchApiUFRNUserSession: Variável de ambiente UFRN_XAPI_KEY ausente.'
    );
    throw new Error('Configuração da API incompleta. Chave X-API-Key ausente.');
  }

  // 3.1 Obter a URL base da API
  const baseUrl = process.env.UFRN_API_URL;
  if (!baseUrl) {
    logger.error(
      'fetchApiUFRNUserSession: Variável de ambiente UFRN_API_URL ausente.'
    );
    throw new Error('Configuração da API incompleta. URL base da API ausente.');
  }

  // 3.2 Construir a URL completa
  const fullUrl = `${baseUrl}${relativeUrl}`;

  // 4. Construir os Headers
  const headers = {
    ...options.headers, // Permite sobrescrever headers padrão se necessário
    Authorization: `Bearer ${userAccessToken}`,
    'X-API-Key': apiKey,
    'Content-Type': 'application/json' // Define um Content-Type padrão para a API UFRN
  };

  // 5. Realizar a requisição Fetch
  try {
    logger.info(`fetchApiUFRNUserSession: Buscando ${fullUrl}...`);
    const response = await fetch(fullUrl, { ...options, headers });

    // 6. Tratar a Resposta
    if (!response.ok) {
      const errorBody = await response.text();
      const statusInfo = `${response.status} ${response.statusText}`;
      logger.error(
        `fetchApiUFRNUserSession: Falha na requisição com status: ${statusInfo}. URL: ${url}. Corpo: ${errorBody}`
      ); // Mantém 'url' para consistência no log, embora 'fullUrl' seja usada na requisição
      throw new Error(`Falha na requisição (${statusInfo})`); // Lança erro para o chamador
    }

    logger.info(
      `fetchApiUFRNUserSession: Requisição para ${fullUrl} bem-sucedida.`
    );
    return response;
  } catch (error) {
    logger.error(
      `fetchApiUFRNUserSession: Erro durante a requisição para ${url}:`,
      error
    );
    // Re-lança o erro (seja o erro do fetch ou o que jogamos acima)
    throw error;
  }
}
