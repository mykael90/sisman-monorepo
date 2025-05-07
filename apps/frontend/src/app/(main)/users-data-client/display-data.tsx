// app/users/display-data.js (ou .tsx)
'use client';

import { useState, use, useTransition } from 'react';
import { Button } from '../../../components/ui/button'; // Ajuste o caminho se necessário
// import Logger from '../../../lib/logger'; // Se precisar logar no cliente

// const logger = new Logger('display-data-client');

export function DisplayData({ dataPromise, refreshAction }) {
  // `use` suspenderá se dataPromise estiver pendente.
  // Quando o componente é montado (ou remontado devido à mudança de key),
  // `use(dataPromise)` obterá o valor resolvido da nova promise.
  const initialData = use(dataPromise);

  // `useState` usa seu argumento APENAS para o render inicial do componente.
  // Como o componente será totalmente novo quando a `key` mudar,
  // `initialData` será o valor correto da nova `dataPromise`.
  const [currentData, setCurrentData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [counter, setCounter] = useState(0); // Este estado também será resetado

  // console.log("DisplayData rendered/remounted. Initial data:", initialData, "Counter:", counter);

  const handleRefresh = () => {
    if (refreshAction) {
      startTransition(() => {
        // Chamar refreshAction() aqui (que é getUsers, uma Server Action).
        // Isso deve, idealmente, fazer com que o Server Component `Page`
        // seja revalidado e re-renderizado. Ao re-renderizar, `Page`
        // gerará uma nova `currentDataPromise` e uma nova `keyForDisplayData`.
        // A nova `key` fará com que esta instância de `DisplayData` seja
        // desmontada e uma nova seja montada, resetando todo o seu estado.
        refreshAction()
          .then(() => {
            // logger.info('refreshAction completed on client, Page should revalidate and re-render.');
            // Não é necessário fazer setCurrentData aqui, pois o componente será remontado
          })
          .catch(error => {
            // logger.error('Error during refreshAction:', error);
            // Lidar com erro, se necessário
          });
      });
    } else {
      console.warn(
        'DisplayData: A propriedade refreshAction não foi fornecida.'
      );
    }
  };

  return (
    <div>
      <Button onClick={handleRefresh} disabled={isPending}>
        {isPending ? 'Refreshing Data...' : 'Refresh Data (Server Action)'}
      </Button>
      <Button
        onClick={() => setCounter(counter + 1)}
        style={{ marginLeft: '8px' }}
      >
        Increment Client Counter: {counter}
      </Button>
      {isPending && <p>Loading new data...</p>}
      <p style={{ marginTop: '10px' }}>
        Current Message: {JSON.stringify(currentData)}
      </p>
    </div>
  );
}
