'use server';

import { revalidatePath } from 'next/cache';
import fetchApiSisman from '../../../lib/fetch/api-sisman';
import Logger from '@/lib/logger';

const logger = new Logger('users-data-client/_actions');

export async function getUsers(accessTokenSisman: string) {
  logger.info('(Server Action) getUsers: Called for initial page load.');
  const response = await fetchApiSisman('/users', accessTokenSisman, {
    cache: 'no-store'
  });
  const data = await response.json();
  // console.log(data);
  // const aguarde = await new Promise(resolve => setTimeout(resolve, 2000));

  return data;
}

export async function getRefreshedUsers() {
  // logger.info(
  //   '(Server Action) refreshUsersData: Called by client, fetching new data...'
  // );
  // const response = await getUsers();

  // Revalida o caminho APÓS buscar os dados e ANTES de retornar (ou em paralelo)
  // Esta é a ação que o usuário disparou.
  logger.info(
    '(Server Action) refreshUsersData: Revalidating /users-data-client'
  );
  revalidatePath('/users-data-client');

  logger.info(
    '(Server Action) refreshUsersData: Path revalidated, returning new data.'
  );

  // Opcionalmente, pode retornar os novos dados para o cliente
  // mas a revalidação + router.refresh() cuidará da UI.
  // Veja que já utiliza a funcão getUsers para montar um novo compomente no server com o revalidatePath,
  // logo esse retorno é apenas para mandar para o cliente, mas lá pode não ter utilidade
  // return response;
}

// export async function addUser(userId, formData) {
//   const data = Object.fromEntries(formData);
//   data.userId = userId;

//   const response = await fetchApiSisman('/users', accessTokenSisman, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(data)
//   });
//   return response.json();
// }
