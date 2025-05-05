import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/_options';

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
    const backendApiResponse = await fetch(
      'https://sistema.api/some-resource',
      {
        headers: {
          Authorization: `Bearer ${session.accessTokenSisman}`
        }
      }
    );

    if (!backendApiResponse.ok) {
      throw new Error(
        `Backend API call failed with status ${backendApiResponse.status}`
      );
    }

    const data = await backendApiResponse.json();
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
