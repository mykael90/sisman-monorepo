// File: app/api/sipac/foto/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/_options';
import { fetchApiSisman, SismanApiError } from '@/lib/fetch/api-sisman';
import Logger from '@/lib/logger';

const logger = new Logger('ProtectedImageAPI');

/**
 * Lida com a resposta de erro, registrando o log e retornando um JSON padronizado.
 */
function handleErrorResponse(
  error: unknown,
  queryString: string
): NextResponse {
  if (error instanceof SismanApiError) {
    logger.error(`Sisman API Error for ?${queryString}: ${error.message}`, {
      status: error.statusCode,
      apiMessage: error.apiMessage,
      error
    });
    return NextResponse.json(
      { message: error.apiMessage || 'Erro na API externa.' },
      { status: error.statusCode || 502 } // 502 Bad Gateway é adequado para erros de upstream.
    );
  }

  // Erro inesperado
  logger.error(`Unexpected error for ?${queryString}:`, error);
  return NextResponse.json(
    { message: 'Internal Server Error' },
    { status: 500 }
  );
}

/**
 * Busca e processa a imagem da API Sisman.
 * Encapsula a lógica de tratamento dos diferentes tipos de resposta da fetchApiSisman.
 * @returns Um objeto contendo o buffer da imagem e o tipo de conteúdo.
 * @throws {SismanApiError} Se a busca da imagem falhar.
 */
async function fetchAndProcessImage(
  queryString: string,
  accessToken: string
): Promise<{ imageBuffer: ArrayBuffer; contentType: string }> {
  const sismanApiResponse = await fetchApiSisman(
    `/sipac/foto?${queryString}`,
    accessToken,
    {
      method: 'GET',
      responseType: 'arraybuffer', // Esperamos um buffer
      cache: 'no-cache'
    }
  );

  // Caso 1: A API retornou um objeto Response padrão.
  if (sismanApiResponse instanceof Response) {
    const contentType =
      sismanApiResponse.headers.get('Content-Type') || 'image/jpeg';
    const imageBuffer = await sismanApiResponse.arrayBuffer();
    return { imageBuffer, contentType };
  }

  // Caso 2: A API retornou diretamente um ArrayBuffer (conforme o código original sugeria ser possível).
  // Se este caso não deveria acontecer, pode ser removido.
  return {
    imageBuffer: sismanApiResponse,
    contentType: 'image/jpeg' // Default para este caso
  };
}

/**
 * GET /api/sipac/foto?{...}
 * Atua como um proxy seguro para buscar imagens da API Sisman,
 * validando a sessão do usuário antes de repassar a requisição.
 */
export async function GET(request: NextRequest) {
  const queryString = request.nextUrl.searchParams.toString();

  // 1. Validação de Entrada
  if (!queryString) {
    logger.warn('GET /api/sipac/foto: A query string é obrigatória.');
    return NextResponse.json(
      { message: 'Parâmetros da imagem são obrigatórios.' },
      { status: 400 }
    );
  }

  // 2. Autenticação
  const session = await getServerSession(authOptions);
  if (!session?.accessTokenSisman) {
    logger.warn(
      `GET /api/sipac/foto?${queryString}: Tentativa de acesso não autorizada.`
    );
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  // 3. Lógica Principal (Busca da Imagem)
  try {
    const { imageBuffer, contentType } = await fetchAndProcessImage(
      queryString,
      session.accessTokenSisman
    );

    logger.info(
      `GET /api/sipac/foto?${queryString}: Imagem obtida com sucesso. Content-Type: ${contentType}`
    );

    // 4. Resposta de Sucesso
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache público e imutável é ótimo para imagens que não mudam.
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    // 5. Tratamento de Erro Centralizado
    return handleErrorResponse(error, queryString);
  }
}
