import { Suspense } from 'react';
import { getUsers } from './_actions';
import { DisplayData } from './display-data';
import Logger from '../../../lib/logger';
import { getSismanAccessToken } from '../../../lib/auth/get-access-token';

const logger = new Logger('users-data-client');

export default async function Page() {
  const accessTokenSisman = await getSismanAccessToken();
  logger.warn(accessTokenSisman);
  const data = getUsers(accessTokenSisman);
  // logger.warn(data);

  return (
    <div>
      <h1>Data Page</h1>
      <Suspense fallback={<p>Loading initial data...</p>}>
        <DisplayData dataPromise={data} />
      </Suspense>
    </div>
  );
}
