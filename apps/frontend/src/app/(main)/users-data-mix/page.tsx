import { Suspense } from 'react';
import { getUsers } from './_actions';
import { DisplayData } from './display-data';
import Logger from '../../../lib/logger';

const logger = new Logger('users-data-client');

export default async function Page() {
  const data = getUsers();

  return (
    <div>
      <h1>Data Page</h1>
      <Suspense
        fallback={
          <p>Loading initial data (suspense envolvendo DisplayData)...</p>
        }
      >
        {/* veja que dataPromise recebe a chamada da função sem await, ou seja, uma promessa. já refreshAction eu passo a declaração da função para ser carregada dentro do cliente */}
        <DisplayData dataPromise={getUsers()} refreshAction={getUsers} />
      </Suspense>
    </div>
  );
}
