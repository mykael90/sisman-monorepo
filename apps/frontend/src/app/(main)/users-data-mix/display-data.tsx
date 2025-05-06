'use client';

import { useState, use, useEffect, useTransition } from 'react';
import { Button } from '../../../components/ui/button';
// import { getUsers } from './_actions'; // getUsers is not called directly in DisplayData

export function DisplayData({ dataPromise, refreshAction }) {
  // The `use` hook will suspend the component if `dataPromise` is pending,
  // and return the resolved value once the promise settles.
  // const aguarde = use(new Promise(resolve => setTimeout(resolve, 500)));
  const initialData = use(dataPromise);

  // Initialize `currentData` with the data resolved from the promise.
  // `useState` only uses its argument for the initial render.
  const [currentData, setCurrentData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [counter, setCounter] = useState(0);

  // This useEffect hook ensures that if `initialData` changes (e.g., if a new `dataPromise`
  // is passed and resolves to different data), `currentData` is updated accordingly.
  useEffect(() => {
    setCurrentData(initialData);
  }, [initialData]);

  const handleRefresh = async () => {
    startTransition(async () => {
      try {
        const newData = await dataPromise; // Chama a Server Action
        setCurrentData(newData);
      } catch (error) {
        console.error('Error refreshing data:', error);
        // Lidar com erro
      }
    });
  };

  return (
    <div>
      <Button onClick={handleRefresh} disabled={isPending}>
        Click me!
      </Button>
      <Button onClick={() => setCounter(counter + 1)} disabled={isPending}>
        Click me!
      </Button>{' '}
      {counter}
      <p>Current Message: {JSON.stringify(currentData)}</p>
      {/* <button onClick={handleRefresh} disabled={isPending}>
        {isPending ? 'Refreshing...' : 'Refresh Data (via Server Action)'}
      </button> */}
    </div>
  );
}
