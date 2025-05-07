import { Suspense, use, useEffect, useMemo } from 'react';
import { addUser } from './_actions';
import { Data } from './data';
import fetchApiSisman from '../../../lib/fetch/api-sisman';
import Logger from '../../../lib/logger';
import { DisplayData } from './display-data';

const logger = new Logger('users-data-client');

export default function Page() {
  return (
    <div>
      <h1>Data Page</h1>
      <Suspense fallback={<p>Loading initial data...</p>}>
        <Data>{({ data }) => <DisplayData data={data} />}</Data>
      </Suspense>
    </div>
  );
}
