import fetchApiSismanUserSession from '@/lib/fetch/api-sisman-user-session'; // Ajustado para usar a API Sisman
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/_options';

export default async function ServerPage() {
  // getServerSession ainda pode ser útil para obter outros dados da sessão
  // ou para verificações iniciais, embora fetchApiSisman já faça a verificação.
  const session = await getServerSession(authOptions);

  let apiSismanData = null; // Renomeado para clareza
  let fetchError = null;

  if (session) {
    // Só tenta buscar se houver uma sessão (opcional, a função fetch já verifica)
    try {
      const response = await fetchApiSismanUserSession(
        '/users' // <-- Substitua pela rota correta da API Sisman
      );
      // Verifica se a resposta foi realmente OK antes de tentar ler o JSON
      if (response.ok) {
        apiSismanData = await response.json();
      } else {
        // O erro já foi logado dentro da função fetch, aqui podemos definir uma mensagem para a UI
        fetchError = `Erro ao buscar dados: ${response.status} ${response.statusText}`;
      }
    } catch (error) {
      console.error('Erro ao chamar fetchApiSisman:', error);
      fetchError =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro desconhecido.';
      // Em caso de erro de autenticação (lançado pela função fetch),
      // você pode querer redirecionar para o login aqui.
      // Ex: if (error.message.includes('Usuário não autenticado') || error.message.includes('401')) { redirect('/login'); }
    }
  } else {
    fetchError = 'Usuário não está logado.';
    // Ou redirecionar diretamente: redirect('/api/auth/signin?callbackUrl=/protected/server');
  }

  return (
    <main className='flex h-[calc(100vh-7rem)] w-full flex-col p-8'>
      <div>
        <h1>Server Page</h1>
        <p>Esta é uma página protegida no lado do servidor.</p>

        <h2>Dados da Sessão:</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>

        <h2>Dados da API Sisman (Protegido):</h2>
        {fetchError && <p style={{ color: 'red' }}>Erro: {fetchError}</p>}
        {apiSismanData && <pre>{JSON.stringify(apiSismanData, null, 2)}</pre>}
        {!apiSismanData && !fetchError && (
          <p>Carregando dados da API Sisman...</p>
        )}
      </div>
    </main>
  );
}
