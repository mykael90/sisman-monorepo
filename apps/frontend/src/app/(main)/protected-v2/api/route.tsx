import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/_options';
import { fetchApiSisman } from '@/lib/fetch/api-sisman';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Agora você pode usar o objeto 'request'
  console.log('Request URL:', request.url);
  console.log('Request Method:', request.method);
  console.log('Request Headers:', request.headers);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401
    });
  }

  // Verifica se o token da API de autorização existe
  if (!session.accessTokenSisman) {
    console.error(
      'User authenticated but lacks API authorization token.',
      session.authorizationError
    );
    return new NextResponse(
      JSON.stringify({
        message: 'Forbidden: API Authorization Failed or Missing'
      }),
      {
        status: 403
      }
    );
  }
  try {
    // Use o session.accessTokenSisman para chamar sua outra API backend
    const data = await fetchApiSisman('/user', session.accessTokenSisman);

    return NextResponse.json(data, {
      status: 200
    });
  } catch (error) {
    console.error('Error calling backend API:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error fetching data from backend API' }),
      {
        status: 500
      }
    );
  }
}
