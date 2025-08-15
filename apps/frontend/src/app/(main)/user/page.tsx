import { UserListPage } from '@/src/app/(main)/user/_components/list/user-list';
import { Suspense } from 'react';
import { getSismanAccessToken } from '@/lib/auth/get-access-token';
import { getRefreshedUsers, getUsers } from './user-actions';
import Logger from '@/lib/logger';
import Loading from '../../../components/loading';

const logger = new Logger('users-management');

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();

  // const accessTokenSisman =  123456
  // Chame getUsers() UMA VEZ para esta renderização do Server Component.
  // Esta promise será passada para o DisplayData. Não espere a resolução da promessa.
  // const currentDataPromise = getUsers(accessTokenSisman);

  const [initialUsers] = await Promise.all([getUsers(accessTokenSisman)]);

  // Gere uma chave única para esta renderização.
  // Pode ser um timestamp, um ID aleatório, ou algo que mude quando
  // você considerar que os dados são "novos".
  // Se getUsers() aceitasse um parâmetro (ex: ID de usuário, página),
  // esse parâmetro seria um candidato ideal para a chave.
  // Como não parece ser o caso aqui, um timestamp ou string aleatória
  // garantirá que, se a Page re-renderizar (ex: após refreshAction),
  // a key será nova, forçando UserListPage a resetar.
  const listKey = Date.now().toString() + Math.random().toString();
  // Ou simplesmente: const keyForDisplayData = Math.random().toString();
  // Ou, se você tiver um ID da sessão de dados: const keyForDisplayData = someDataSessionId;
  // Fazia mais sentido ainda ser a query que foi enviada para realizar alguma filtragem no fetch

  // logger.info(
  //   `Page RSC render: dataPromise created. Key for DisplayData: ${keyForDisplayData}`
  // );

  return (
    // <Suspense fallback={<Loading />}>
    <UserListPage
      initialUsers={initialUsers} // Passa a promise criada acima
      refreshAction={getRefreshedUsers} // Passa a referência da função Server Action
      key={listKey} // Passa a string gerada como chave
    />
    // </Suspense>
  );
}
