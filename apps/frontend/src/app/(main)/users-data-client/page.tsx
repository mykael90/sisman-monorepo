// app/users/page.tsx (ou onde quer que este componente esteja)
import { Suspense } from 'react';
import { getRefreshedUsers, getUsers } from './_actions'; // Sua Server Action
import { DisplayData } from './display-data'; // Seu Client Component
import Logger from '../../../lib/logger'; // Seu logger
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';

const logger = new Logger('users-data-page');

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  // const accessTokenSisman =  123456
  // Chame getUsers() UMA VEZ para esta renderização do Server Component.
  // Esta promise será passada para o DisplayData.
  const currentDataPromise = getUsers(accessTokenSisman);

  // Gere uma chave única para esta renderização.
  // Pode ser um timestamp, um ID aleatório, ou algo que mude quando
  // você considerar que os dados são "novos".
  // Se getUsers() aceitasse um parâmetro (ex: ID de usuário, página),
  // esse parâmetro seria um candidato ideal para a chave.
  // Como não parece ser o caso aqui, um timestamp ou string aleatória
  // garantirá que, se a Page re-renderizar (ex: após refreshAction),
  // a key será nova, forçando DisplayData a resetar.
  const keyForDisplayData = Date.now().toString() + Math.random().toString();
  // Ou simplesmente: const keyForDisplayData = Math.random().toString();
  // Ou, se você tiver um ID da sessão de dados: const keyForDisplayData = someDataSessionId;
  // Fazia mais sentido ainda ser a query que foi enviada para realizar alguma filtragem no fetch

  logger.info(
    `Page RSC render: dataPromise created. Key for DisplayData: ${keyForDisplayData}`
  );

  return (
    <div>
      <h1>Data Page</h1>
      <Suspense
        fallback={
          <p>Loading initial data (suspense envolvendo DisplayData)...</p>
        }
      >
        <DisplayData
          dataPromise={currentDataPromise} // Passa a promise criada acima
          refreshAction={getRefreshedUsers} // Passa a referência da função Server Action
          key={keyForDisplayData} // Passa a string gerada como chave
        />
      </Suspense>
    </div>
  );
}
