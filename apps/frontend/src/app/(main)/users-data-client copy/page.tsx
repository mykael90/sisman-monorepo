'use client';

import { Suspense, use, useEffect, useMemo } from 'react';
import { addUser } from './_actions';
import { DisplayData } from './display-data';
import fetchApiSisman from '../../../lib/fetch/api-sisman';
import Logger from '../../../lib/logger';

const logger = new Logger('users-data-client');

export default function Page() {
  // const data = getUsers();
  // logger.warn(data);

  return (
    <div>
      <h1>Data Page</h1>
      <Suspense fallback={<p>Loading initial data...</p>}>
        <DisplayData
        // dataPromise={data}
        />
      </Suspense>
    </div>
  );
}

export async function getUsers() {
  const response = await fetchApiSisman('/users', {
    cache: 'no-store'
  });
  const data = await response.json();
  // console.log(data);
  return data;
}
