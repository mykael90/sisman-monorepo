'use client';

import { useState, use, useEffect } from 'react';
// import { getUsers } from './_actions'; // getUsers is not called directly in DisplayData

export function DisplayData({ dataPromise }) {
  // The `use` hook will suspend the component if `dataPromise` is pending,
  // and return the resolved value once the promise settles.
  const resolvedData = use(dataPromise);

  // Initialize `currentData` with the data resolved from the promise.
  // `useState` only uses its argument for the initial render.
  const [currentData, setCurrentData] = useState(resolvedData);

  // This useEffect hook ensures that if `resolvedData` changes (e.g., if a new `dataPromise`
  // is passed and resolves to different data), `currentData` is updated accordingly.
  useEffect(() => {
    setCurrentData(resolvedData);
  }, [resolvedData]);

  return (
    <div>
      <p>Current Message: {JSON.stringify(currentData)}</p>
      {/* <button onClick={handleRefresh} disabled={isPending}>
        {isPending ? 'Refreshing...' : 'Refresh Data (via Server Action)'}
      </button> */}
    </div>
  );
}
