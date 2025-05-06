import { Suspense } from 'react';
import { getUsers } from './_actions';
import { DisplayData } from './display-data';
import Logger from '../../../lib/logger';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';

const logger = new Logger('users-data-client');

const accessTokenSisman = await getSismanAccessToken();

async function refreshData() {
  'use server';
  const data = await getUsers(accessTokenSisman);
  return data;
}

export default async function Page() {
  logger.warn(accessTokenSisman);
  //deixar para resolver a promessa no cliente, promove uma melhor experiência do usuário
  const data = getUsers(accessTokenSisman);

  return (
    <div>
      <h1>Data Page</h1>
      <Suspense
        fallback={
          <p>Loading initial data (suspense envolvendo DisplayData)...</p>
        }
      >
        <DisplayData dataPromise={data} refreshAction={refreshData} />
      </Suspense>
    </div>
  );
}
